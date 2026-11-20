import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, open, readFile, rename, stat, unlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { connect, externalDirectory, loadSnapshot, required, run, saveJson, sha256, type Row } from "./common";
import { createStorageClient, downloadStorageObject, storageBucket, storageConfig } from "../../lib/storage-client";
import { safeFilename } from "../../lib/file-policy";

type Entry = { oldKey: string; newKey: string; fileId: string; size: number; mimeType?: string; sha256?: string; projectIds: string[]; metadata?: Row; status: "pending" | "backed-up" | "verified" };
type Manifest = { version: 1; snapshotDigest: string; sourceBucket: string; entries: Entry[]; target?: string; bucket?: string };
async function* chunks(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  try { while (true) { const { done, value } = await reader.read(); if (done) return; yield value; } }
  finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
async function digest(filename: string) { const hash = createHash("sha256"); for await (const chunk of createReadStream(filename)) hash.update(chunk); return hash.digest("hex"); }

await run(async () => {
  const [command, output] = process.argv.slice(2);
  if (!["backup", "migrate", "verify"].includes(command) || !output) throw new Error("Usage: bun run storage:migrate-s3 backup|migrate|verify <external-directory>");
  const directory = await externalDirectory(output);
  await mkdir(path.join(directory, "s3-objects"), { recursive: true, mode: 0o700 });
  const lockPath = path.join(directory, "s3-files.lock"); const lock = await open(lockPath, "wx");
  try {
    const snapshot = await loadSnapshot(directory);
    const snapshotDigest = sha256(await readFile(path.join(directory, "database.json")));
    const manifestPath = path.join(directory, "s3-files.json");
    let manifest: Manifest | undefined;
    try { manifest = JSON.parse(await readFile(manifestPath, "utf8")); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    if (manifest && manifest.snapshotDigest !== snapshotDigest) throw new Error("Manifest belongs to another database snapshot.");
    if (command === "backup") {
      const sourceBucket = required("SOURCE_S3_BUCKET");
      const source = new S3Client({ endpoint: required("SOURCE_S3_ENDPOINT"), region: process.env.SOURCE_S3_REGION || "us-east-1", forcePathStyle: process.env.SOURCE_S3_FORCE_PATH_STYLE !== "false", credentials: { accessKeyId: required("SOURCE_S3_ACCESS_KEY_ID"), secretAccessKey: required("SOURCE_S3_SECRET_ACCESS_KEY") }, requestChecksumCalculation: "WHEN_REQUIRED", requestHandler: { connectionTimeout: 10_000, socketTimeout: 60_000 } });
      try {
        if (!manifest) {
          const entries: Entry[] = []; let continuation: string | undefined;
          do {
            const response = await source.send(new ListObjectsV2Command({ Bucket: sourceBucket, ContinuationToken: continuation }));
            for (const item of response.Contents || []) {
              if (!item.Key || item.Size === undefined) throw new Error("Source S3 inventory is incomplete.");
              const id = `source-s3-${sha256(item.Key).slice(0, 32)}`;
              entries.push({ oldKey: item.Key, newKey: `migrated/${id}/${safeFilename(path.posix.basename(item.Key))}`, fileId: id, size: item.Size, projectIds: [], status: "pending" });
            }
            continuation = response.IsTruncated ? response.NextContinuationToken : undefined;
            if (response.IsTruncated && !continuation) throw new Error("Source S3 pagination token is missing.");
          } while (continuation);
          const base = new URL(process.env.SOURCE_S3_PUBLIC_URL || required("SOURCE_S3_ENDPOINT"));
          for (const project of snapshot.rows.Project) {
            if (!project.image) continue;
            let url: URL; try { url = new URL(String(project.image)); } catch { throw new Error("Source contains local images; back up the application data/uploads volume first."); }
            if (url.origin !== base.origin) throw new Error("Source contains an external image; inventory its provider before migrating.");
            const prefix = `${base.pathname.replace(/\/$/, "")}/${sourceBucket}/`;
            if (!url.pathname.startsWith(prefix)) throw new Error("Source image URL does not match the source bucket.");
            const key = decodeURIComponent(url.pathname.slice(prefix.length));
            const entry = entries.find((item) => item.oldKey === key);
            if (!entry) throw new Error("Source project references a missing S3 object.");
            entry.projectIds.push(String(project.id));
          }
          for (const entry of entries) if (!entry.projectIds.length) entry.newKey = `unreferenced/${entry.fileId}/${safeFilename(path.posix.basename(entry.oldKey))}`;
          manifest = { version: 1, snapshotDigest, sourceBucket, entries };
          await saveJson(manifestPath, manifest);
        }
        if (manifest.sourceBucket !== sourceBucket) throw new Error("Manifest source bucket mismatch.");
        for (const entry of manifest.entries) {
          const filename = path.join(directory, "s3-objects", `${sha256(entry.oldKey)}.bin`);
          if (entry.sha256 && await digest(filename) === entry.sha256) continue;
          const response = await source.send(new GetObjectCommand({ Bucket: sourceBucket, Key: entry.oldKey }), { abortSignal: AbortSignal.timeout(90_000) });
          if (!response.Body) throw new Error("Source object has no body.");
          // The Node HTTP handler returns a native readable. Avoid the Bun/Node
          // web-stream adapter, which can stall after a backpressure boundary.
          await pipeline(response.Body as Readable, createWriteStream(`${filename}.tmp`, { mode: 0o600 }));
          if ((await stat(`${filename}.tmp`)).size !== entry.size) throw new Error("Source object changed during backup.");
          await rename(`${filename}.tmp`, filename);
          entry.mimeType = response.ContentType || "application/octet-stream"; entry.sha256 = await digest(filename); entry.status = "backed-up";
          await saveJson(manifestPath, manifest);
        }
      } finally { source.destroy(); }
      console.log(JSON.stringify({ backedUp: manifest.entries.length, projectReferences: manifest.entries.reduce((n, entry) => n + entry.projectIds.length, 0), bytes: manifest.entries.reduce((n, entry) => n + entry.size, 0) }));
      return;
    }
    if (!manifest) throw new Error("Manifest missing; back up S3 first.");
    const config = storageConfig();
    if (manifest.target && (manifest.target !== config.url || manifest.bucket !== config.bucket)) throw new Error("Manifest belongs to another target.");
    const { data: bucket, error: bucketError } = await createStorageClient().storage.getBucket(config.bucket);
    if (bucketError || !bucket || bucket.public) throw new Error("Bucket must exist and be private.");
    if (command === "migrate" && process.env.CONFIRM_STORAGE_WRITE !== "true") throw new Error("Storage writes require CONFIRM_STORAGE_WRITE=true.");
    const client = await connect("TARGET_DATABASE_URL");
    try {
      manifest.target = config.url; manifest.bucket = config.bucket;
      for (const entry of manifest.entries) {
        const filename = path.join(directory, "s3-objects", `${sha256(entry.oldKey)}.bin`);
        if (!entry.sha256 || await digest(filename) !== entry.sha256) throw new Error("File backup checksum mismatch.");
        if (command === "migrate") {
          const { data: exists, error: infoError } = await storageBucket().info(entry.newKey);
          if (infoError && !["400", "404"].includes(String(infoError.statusCode))) throw new Error("Storage object lookup failed.");
          if (!exists) { const { error } = await storageBucket().upload(entry.newKey, createReadStream(filename), { contentType: entry.mimeType, duplex: "half", upsert: false }); if (error) throw new Error("Storage upload failed."); }
        }
        const { body } = await downloadStorageObject(entry.newKey); const hash = createHash("sha256"); let size = 0;
        for await (const chunk of chunks(body)) { hash.update(chunk); size += chunk.length; }
        if (size !== entry.size || hash.digest("hex") !== entry.sha256) throw new Error("Verification remote object checksum mismatch.");
        if (command === "migrate") {
          await client.query("BEGIN");
          try {
            const url = `/api/files/${entry.fileId}`;
            await client.query(`INSERT INTO "UploadedFile" (id,"ownerType",filename,key,"mimeType",size,url,provider,"createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,'supabase',$8,$8) ON CONFLICT (id) DO NOTHING`, [entry.fileId, entry.projectIds.length ? "PROJECT" : "GENERAL", path.posix.basename(entry.oldKey), entry.newKey, entry.mimeType, entry.size, url, snapshot.capturedAt]);
            const record = (await client.query(`SELECT * FROM "UploadedFile" WHERE id=$1`, [entry.fileId])).rows[0];
            if (record.key !== entry.newKey || record.provider !== "supabase" || Number(record.size) !== entry.size) throw new Error("Target file metadata conflict.");
            for (const id of entry.projectIds) {
              const original = snapshot.rows.Project.find((project) => project.id === id)!;
              const result = await client.query(`UPDATE "Project" SET image=$1,"fileId"=$2 WHERE id=$3 AND image IN ($4,$1) RETURNING id`, [url, entry.fileId, id, original.image]);
              if (result.rowCount !== 1) throw new Error("Target project changed during migration.");
            }
            await client.query("COMMIT"); entry.metadata = record; entry.status = "verified"; await saveJson(manifestPath, manifest);
          } catch (error) { await client.query("ROLLBACK"); throw error; }
        } else {
          const { rows } = await client.query(`SELECT id FROM "UploadedFile" WHERE id=$1 AND key=$2 AND provider='supabase'`, [entry.fileId, entry.newKey]);
          if (rows.length !== 1) throw new Error("Verification file metadata missing.");
          for (const id of entry.projectIds) if ((await client.query(`SELECT id FROM "Project" WHERE id=$1 AND image=$2 AND "fileId"=$3`, [id, `/api/files/${entry.fileId}`, entry.fileId])).rows.length !== 1) throw new Error("Verification project image reference mismatch.");
        }
      }
      await saveJson(path.join(directory, "s3-verification.json"), { verifiedAt: new Date().toISOString(), files: manifest.entries.length, bytes: manifest.entries.reduce((n, entry) => n + entry.size, 0), passed: true });
      console.log(JSON.stringify({ command, verified: manifest.entries.length }));
    } finally { await client.end(); }
  } finally { await lock.close(); await unlink(lockPath); }
});
