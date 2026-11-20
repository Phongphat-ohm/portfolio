import { afterAll, beforeAll, expect, test } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";

const database = new PGlite();
beforeAll(async () => {
  await database.exec("CREATE ROLE anon; CREATE ROLE authenticated;");
  await database.exec(await readFile("prisma/migrations/20260527163513_init/migration.sql", "utf8"));
  // Simulate legacy data and hash bytes BEFORE applying the new migration.
  await database.exec(`INSERT INTO "AdminUser" VALUES ('old-admin','admin',null,'pbkdf2_sha256$120000$salt$original',null,'admin','2025-01-01','2025-01-01');
    INSERT INTO "UploadedFile" (id,"ownerType",filename,key,"mimeType",size,url,provider,"updatedAt") VALUES ('legacy-file','GENERAL','old.pdf','/portfolio/old.pdf','application/pdf',123,'/api/files/legacy-file','sftpgo','2025-01-01');
    INSERT INTO "Project" (id,title,slug,summary,"fileId",published,"updatedAt") VALUES ('draft','Draft','draft','draft','legacy-file',false,'2025-01-01');
    INSERT INTO "Certificate" (id,title,issuer,"imageUrl",published,"updatedAt") VALUES ('cert','Cert','Issuer','/api/files/legacy-file',true,'2025-01-01');`);
  await database.exec(await readFile("prisma/migrations/20261120000000_supabase_storage/migration.sql", "utf8"));
}, 30000);
afterAll(async () => { await database.close(); });

test("migration preserves IDs, password hashes, timestamps and existing providers", async () => {
  const admin = (await database.query(`SELECT id,"passwordHash","createdAt"::text FROM "AdminUser"`)).rows[0];
  expect(admin.id).toBe("old-admin");
  expect(admin.passwordHash).toBe("pbkdf2_sha256$120000$salt$original");
  const file = (await database.query(`SELECT id,provider,url FROM "UploadedFile"`)).rows[0];
  expect(file).toEqual({ id: "legacy-file", provider: "sftpgo", url: "/api/files/legacy-file" });
  const columns = (await database.query(`SELECT column_default FROM information_schema.columns WHERE table_name='UploadedFile' AND column_name='provider'`)).rows;
  expect(columns[0].column_default).toContain("supabase");
});

test("all five app tables enforce RLS and API roles have no grants", async () => {
  const tables = (await database.query(`SELECT relname,relrowsecurity FROM pg_class WHERE relname IN ('AdminUser','UploadedFile','Project','Certificate','StorageCleanupJob')`)).rows;
  expect(tables.length).toBe(5);
  expect(tables.every((table) => table.relrowsecurity)).toBe(true);
  const grants = (await database.query(`SELECT * FROM information_schema.role_table_grants WHERE grantee IN ('anon','authenticated','PUBLIC') AND table_name IN ('AdminUser','UploadedFile','Project','Certificate','StorageCleanupJob')`)).rows;
  expect(grants).toEqual([]);
});

test("runtime role reads hashes for login, writes content, but cannot change accounts or schema", async () => {
  await database.exec("SET ROLE portfolio_runtime");
  try {
    expect((await database.query(`SELECT count(*)::int AS count FROM "AdminUser"`)).rows[0].count).toBe(1);
    await database.exec(`UPDATE "Project" SET title='Updated' WHERE id='draft'`);
    await expect(database.exec(`UPDATE "AdminUser" SET role='owner' WHERE id='old-admin'`)).rejects.toThrow();
    await expect(database.exec(`CREATE TABLE public.unexpected(id text)`)).rejects.toThrow();
  } finally { await database.exec("RESET ROLE"); }
});

test("anonymous role cannot query password hashes or content tables directly", async () => {
  await database.exec("SET ROLE anon");
  try {
    await expect(database.query(`SELECT * FROM "AdminUser"`)).rejects.toThrow();
    await expect(database.query(`SELECT * FROM "Project"`)).rejects.toThrow();
  } finally { await database.exec("RESET ROLE"); }
});

test("legacy imageUrl references and shared published references resolve", async () => {
  const query = `SELECT EXISTS(SELECT 1 FROM "Project" WHERE published AND ("fileId"=$1 OR "imageUrl"=$2)) OR EXISTS(SELECT 1 FROM "Certificate" WHERE published AND ("fileId"=$1 OR "imageUrl"=$2)) AS allowed`;
  const args = ["legacy-file", "/api/files/legacy-file"];
  expect((await database.query(query, args)).rows[0].allowed).toBe(true);
  await database.exec(`UPDATE "Certificate" SET published=false WHERE id='cert'`);
  expect((await database.query(query, args)).rows[0].allowed).toBe(false);
  await database.exec(`UPDATE "Project" SET published=true WHERE id='draft'`);
  expect((await database.query(query, args)).rows[0].allowed).toBe(true);
});

test("intent and metadata commit or roll back together", async () => {
  await database.exec(`INSERT INTO "StorageCleanupJob" (id,key,"nextAttemptAt") VALUES ('intent','uploads/new/file.pdf',now());`);
  await expect(database.transaction(async (tx) => {
    await tx.exec(`DELETE FROM "StorageCleanupJob" WHERE id='intent'`);
    throw new Error("simulated commit failure");
  })).rejects.toThrow("simulated commit failure");
  expect((await database.query(`SELECT count(*)::int AS count FROM "StorageCleanupJob" WHERE id='intent'`)).rows[0].count).toBe(1);
});
