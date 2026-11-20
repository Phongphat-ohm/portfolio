import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, open, readFile, rename, stat, unlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { createStorageClient, downloadStorageObject, storageBucket, storageConfig } from "../../lib/storage-client";
import { safeFilename } from "../../lib/file-policy";
import { connect, externalDirectory, loadSnapshot, run, saveJson, sha256, type Row } from "./common";
import { listSourceFiles, sftpRequest } from "./sftp-source";

type Entry = { oldKey: string; newKey: string; fileId?: string; size: number; mimeType: string; sha256?: string; status: "pending" | "backed-up" | "verified" };
type Manifest = { version: 1; source: "sftpgo" | "supabase"; snapshotDigest?: string; target?: string; bucket?: string; entries: Entry[] };

async function digestFile(filename: string) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filename)) hash.update(chunk);
  return hash.digest("hex");
}
const backupPath = (directory: string, entry: Entry) => path.join(directory, "objects", `${sha256(entry.oldKey)}.bin`);

async function backupBody(body: ReadableStream<Uint8Array> | null, filename: string, size: number) {
  if (!body) throw new Error("File response has no body.");
  await pipeline(Readable.from(streamChunks(body)), createWriteStream(`${filename}.tmp`, { mode: 0o600 }));
  if ((await stat(`${filename}.tmp`)).size !== size) throw new Error("File size changed during backup; take a fresh frozen snapshot.");
  await rename(`${filename}.tmp`, filename);
  return digestFile(filename);
}

async function* streamChunks(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}

async function listSupabase(prefix = ""): Promise<{ key: string; size: number; mimeType: string }[]> {
  const files: { key: string; size: number; mimeType: string }[] = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await storageBucket().list(prefix, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error("Storage listing failed.");
    for (const item of data) {
      const key = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) files.push(...await listSupabase(key));
      else files.push({ key, size: Number(item.metadata?.size), mimeType: item.metadata?.mimetype || "application/octet-stream" });
    }
    if (data.length < 100) return files;
  }
}

async function verifiedObject(entry: Entry) {
  const { body } = await downloadStorageObject(entry.newKey);
  const hash = createHash("sha256");
  let size = 0;
  for await (const chunk of streamChunks(body)) { hash.update(chunk); size += chunk.length; }
  if (hash.digest("hex") !== entry.sha256 || size !== entry.size) throw new Error("Verification storage checksum mismatch.");
}

function fileEntry(file: Row): Entry {
  if (file.provider !== "sftpgo") throw new Error("Source contains an unsupported provider; reconcile inventory before migration.");
  return { oldKey: String(file.key), newKey: `migrated/${String(file.id)}/${safeFilename(String(file.filename))}`, fileId: String(file.id), size: Number(file.size), mimeType: String(file.mimeType), status: "pending" };
}

await run(async () => {
  const [command, output] = process.argv.slice(2);
  if (!["backup-sftp", "migrate", "verify", "backup-supabase", "restore-supabase"].includes(command) || !output) throw new Error("Usage: bun run storage:migrate backup-sftp|migrate|verify|backup-supabase|restore-supabase <external-directory>");
  const directory = await externalDirectory(output);
  await mkdir(path.join(directory, "objects"), { recursive: true, mode: 0o700 });
  const lockPath = path.join(directory, "files.lock");
  const lock = await open(lockPath, "wx");
  try {
    const manifestPath = path.join(directory, "files.json");
    let manifest: Manifest | undefined;
    try { manifest = JSON.parse(await readFile(manifestPath, "utf8")); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    if (command === "backup-sftp") {
      const snapshot = await loadSnapshot(directory);
      const snapshotDigest = sha256(await readFile(path.join(directory, "database.json")));
      if (manifest && (manifest.source !== "sftpgo" || manifest.snapshotDigest !== snapshotDigest)) throw new Error("Manifest belongs to a different snapshot. Use a new external directory.");
      if (!manifest) {
        const listed = await listSourceFiles(process.env.SFTPGO_REMOTE_DIR || "/portfolio");
        const entries = snapshot.rows.UploadedFile.map(fileEntry);
        const tracked = new Set(entries.map((entry) => entry.oldKey));
        for (const item of listed) if (!tracked.has(item.key)) entries.push({ oldKey: item.key, newKey: `unreferenced/${sha256(item.key)}/${safeFilename(path.posix.basename(item.key))}`, size: item.size, mimeType: "application/octet-stream", status: "pending" });
        manifest = { version: 1, source: "sftpgo", snapshotDigest, entries };
        await saveJson(manifestPath, manifest);
      }
      for (const entry of manifest.entries) {
        const filename = backupPath(directory, entry);
        // Resume still revalidates local bytes. Do not trust a status flag alone.
        if (entry.sha256 && await digestFile(filename) === entry.sha256) continue;
        entry.sha256 = await backupBody((await sftpRequest("files", entry.oldKey)).body, filename, entry.size);
        entry.status = "backed-up";
        await saveJson(manifestPath, manifest);
      }
      const hashGroups = new Map<string, string[]>();
      for (const entry of manifest.entries) hashGroups.set(entry.sha256!, [...(hashGroups.get(entry.sha256!) || []), entry.oldKey]);
      await saveJson(path.join(directory, "file-inventory.json"), { files: manifest.entries.length, bytes: manifest.entries.reduce((sum, file) => sum + file.size, 0), unreferenced: manifest.entries.filter((file) => !file.fileId).length, duplicateContent: [...hashGroups.values()].filter((keys) => keys.length > 1) });
      console.log(JSON.stringify({ backedUp: manifest.entries.length }));
      return;
    }
    const config = storageConfig();
    const { data: bucket, error: bucketError } = await createStorageClient().storage.getBucket(config.bucket);
    if (bucketError || !bucket || bucket.public) throw new Error("Bucket must exist and be private.");
    if (command !== "restore-supabase" && manifest?.target && (manifest.target !== config.url || manifest.bucket !== config.bucket)) throw new Error("Manifest is bound to another target. Use separate staging/production manifests.");
    if (command === "backup-supabase") {
      if (manifest && manifest.source !== "supabase") throw new Error("Manifest is a migration manifest. Use a new directory for operational backups.");
      if (!manifest) {
        manifest = { version: 1, source: "supabase", target: config.url, bucket: config.bucket, entries: (await listSupabase()).map((file) => ({ oldKey: file.key, newKey: file.key, size: file.size, mimeType: file.mimeType, status: "pending" })) };
        await saveJson(manifestPath, manifest);
      }
      for (const entry of manifest.entries) {
        const filename = backupPath(directory, entry);
        if (entry.sha256 && await digestFile(filename) === entry.sha256) continue;
        entry.sha256 = await backupBody((await downloadStorageObject(entry.oldKey)).body, filename, entry.size);
        entry.status = "backed-up";
        await saveJson(manifestPath, manifest);
      }
      console.log(JSON.stringify({ backedUp: manifest.entries.length }));
      return;
    }
    if (!manifest || manifest.version !== 1) throw new Error("Manifest missing. Back up source files first.");
    if (command === "migrate" && manifest.source !== "sftpgo") throw new Error("Manifest must be an SFTPGo migration snapshot.");
    if (command !== "verify" && process.env.CONFIRM_STORAGE_WRITE !== "true") throw new Error("Storage writes require CONFIRM_STORAGE_WRITE=true.");
    manifest.target = config.url;
    manifest.bucket = config.bucket;
    await saveJson(manifestPath, manifest);
    const client = command === "migrate" ? await connect("TARGET_DATABASE_URL") : null;
    try {
      for (const entry of manifest.entries) {
        const filename = backupPath(directory, entry);
        if (!entry.sha256 || await digestFile(filename) !== entry.sha256) throw new Error("File backup checksum mismatch.");
        if (command !== "verify") {
          const { data: exists, error: infoError } = await storageBucket().info(entry.newKey);
          if (infoError && !["404", "400"].includes(String(infoError.statusCode))) throw new Error("Storage object lookup failed.");
          if (!exists) {
            const { error } = await storageBucket().upload(entry.newKey, createReadStream(filename), { contentType: entry.mimeType, upsert: false, duplex: "half" });
            if (error) throw new Error("Storage upload failed; check project upload limits and MIME restrictions.");
          }
        }
        await verifiedObject(entry);
        if (client && entry.fileId) {
          const result = await client.query(`UPDATE public."UploadedFile" SET "key"=$1,provider='supabase' WHERE id=$2 AND (("key"=$3 AND provider='sftpgo') OR ("key"=$1 AND provider='supabase')) RETURNING id`, [entry.newKey, entry.fileId, entry.oldKey]);
          if (result.rowCount !== 1) throw new Error("Target file metadata diverged from source snapshot.");
        }
        if (command !== "verify") { entry.status = "verified"; await saveJson(manifestPath, manifest); }
      }
    } finally { await client?.end(); }
    await saveJson(path.join(directory, "storage-verification.json"), { verifiedAt: new Date().toISOString(), passed: true, files: manifest.entries.length });
    console.log(JSON.stringify({ command, verified: manifest.entries.length }));
  } finally { await lock.close(); await unlink(lockPath); }
});
