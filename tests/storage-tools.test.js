import { afterAll, beforeAll, expect, test } from "bun:test";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
let directory;
let server;
const objects = new Map();
const source = new Map([["/portfolio/old.pdf", Buffer.from("%PDF-1.7 original")], ["/portfolio/orphan.txt", Buffer.from("orphan file")]]);
let uploads = 0;
beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "portfolio-storage-test-"));
  const snapshot = { version: 1, rows: { AdminUser: [], Project: [], Certificate: [], UploadedFile: [{ id: "old-id", filename: "old.pdf", key: "/portfolio/old.pdf", provider: "sftpgo", mimeType: "application/pdf", size: source.get("/portfolio/old.pdf").length }] } };
  const bytes = JSON.stringify(snapshot);
  await writeFile(path.join(directory, "database.json"), bytes);
  await writeFile(path.join(directory, "database.sha256"), hash(bytes));
  server = Bun.serve({ port: 0, async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.endsWith("/user/token")) return Response.json({ access_token: "source-token" });
    if (url.pathname.endsWith("/user/dirs")) return Response.json([...source].map(([key, bytes]) => ({ name: path.posix.basename(key), mode: 420, size: bytes.length })));
    if (url.pathname.endsWith("/user/files")) return new Response(source.get(url.searchParams.get("path")));
    if (url.pathname === "/storage/v1/bucket/portfolio-files") return Response.json({ id: "portfolio-files", name: "portfolio-files", public: false });
    if (url.pathname.includes("/storage/v1/object/info/portfolio-files/")) {
      const key = decodeURIComponent(url.pathname.split("/portfolio-files/")[1]);
      return objects.has(key) ? Response.json({ name: key, size: objects.get(key).length, content_type: "application/octet-stream" }) : Response.json({ statusCode: "404", error: "not_found", message: "missing" }, { status: 404 });
    }
    if (url.pathname.startsWith("/storage/v1/object/portfolio-files/")) {
      const key = decodeURIComponent(url.pathname.split("/portfolio-files/")[1]);
      if (request.method === "POST") {
        uploads++;
        if (objects.has(key)) return Response.json({ message: "exists", statusCode: "409" }, { status: 409 });
        objects.set(key, Buffer.from(await request.arrayBuffer()));
        return Response.json({ Key: key });
      }
      return objects.has(key) ? new Response(objects.get(key)) : new Response("missing", { status: 404 });
    }
    return new Response("not mocked", { status: 404 });
  } });
});
afterAll(async () => {
  server?.stop(true);
  if (directory && directory.startsWith(path.join(tmpdir(), "portfolio-storage-test-"))) await rm(directory, { recursive: true, force: true });
});

async function command(action) {
  const proc = Bun.spawn([process.execPath, "src/scripts/migration/files.ts", action, directory], {
    env: { ...process.env, SFTPGO_BASE_URL: server.url.toString(), SFTPGO_USERNAME: "test", SFTPGO_PASSWORD: "test", SFTPGO_REMOTE_DIR: "/portfolio", SUPABASE_URL: server.url.toString(), SUPABASE_SECRET_KEY: "sb_secret_test", SUPABASE_STORAGE_BUCKET: "portfolio-files", CONFIRM_STORAGE_WRITE: "true" },
    stdout: "pipe", stderr: "pipe",
  });
  const [stdout, stderr, code] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text(), proc.exited]);
  return { stdout, stderr, code };
}

test("file tools back up tracked and orphan files, resume, restore and verify without overwrites", async () => {
  let result = await command("backup-sftp");
  expect(result.stderr).toBe("");
  expect(result.code).toBe(0);
  const manifest = JSON.parse(await readFile(path.join(directory, "files.json"), "utf8"));
  expect(manifest.entries.length).toBe(2);
  expect(manifest.entries[0].newKey).toBe("migrated/old-id/old.pdf");
  expect(manifest.entries[1].newKey).toStartWith("unreferenced/");
  expect((await readdir(path.join(directory, "objects"))).length).toBe(2);
  expect((await command("backup-sftp")).code).toBe(0);
  result = await command("restore-supabase");
  expect(result.stderr).toBe("");
  expect(result.code).toBe(0);
  expect(uploads).toBe(2);
  expect((await command("restore-supabase")).code).toBe(0);
  expect(uploads).toBe(2);
  expect((await command("verify")).code).toBe(0);
  objects.set(manifest.entries[0].newKey, Buffer.from("corrupted"));
  result = await command("restore-supabase");
  expect(result.code).toBe(1);
  expect(uploads).toBe(2);
  expect(result.stderr).toContain("checksum mismatch");
}, 30000);

test("local backup corruption aborts verification", async () => {
  const manifest = JSON.parse(await readFile(path.join(directory, "files.json"), "utf8"));
  await writeFile(path.join(directory, "objects", hash(manifest.entries[0].oldKey) + ".bin"), "corrupted");
  const result = await command("verify");
  expect(result.code).toBe(1);
  expect(result.stderr).toContain("checksum mismatch");
}, 10000);
