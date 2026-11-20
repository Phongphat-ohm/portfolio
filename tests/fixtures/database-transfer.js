// Isolated process: mock only the wire transport, execute real SQL with PostgreSQL.
import { mock } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import assert from "node:assert/strict";

const source = new PGlite();
const target = new PGlite();
const parsers = {};
mock.module("pg", () => ({
  types: { setTypeParser(oid, parser) { parsers[oid] = parser; } },
  Client: class {
    constructor({ connectionString }) { this.db = connectionString.includes("source") ? source : target; }
    async connect() {}
    async end() {}
    async query(query, params) { return this.db.query(query, params, { parsers }); }
  },
}));

const directory = await mkdtemp(path.join(tmpdir(), "portfolio-database-test-"));
try {
  const initial = await readFile("docs/legacy-migrations/20260527163513_init.sql", "utf8");
  await source.exec(initial);
  await target.exec(initial);
  await target.exec(await readFile("docs/legacy-migrations/20261120000000_supabase_storage.sql", "utf8"));
  await source.query(`INSERT INTO "AdminUser" (id,username,"passwordHash","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$4)`, ["old-admin", "original-username", "pbkdf2_sha256$120000$salt$unchanged", "2025-01-20 18:24:12.123"]);
  await source.query(`INSERT INTO "UploadedFile" (id,filename,key,"mimeType",size,url,provider,"updatedAt") VALUES ('old-file','file.pdf','/portfolio/file.pdf','application/pdf',123,'/api/files/old-file','sftpgo','2025-01-01')`);
  await source.query(`INSERT INTO "Project" (id,title,slug,summary,stack,"fileId","updatedAt") VALUES ('old-project','Title','slug','Summary',ARRAY['Next.js','Postgres'],'old-file','2025-01-01')`);
  process.env.SOURCE_DATABASE_URL = "postgres://source";
  process.env.TARGET_DATABASE_URL = "postgres://target";
  process.env.CONFIRM_TARGET_IMPORT = "true";
  let index = 0;
  async function command(name) {
    process.argv = [process.execPath, "database.ts", name, directory];
    await import(`../../src/scripts/migration/database.ts?run=${index++}`);
  }
  await command("export");
  assert.equal(process.exitCode || 0, 0);
  await command("import");
  assert.equal(process.exitCode || 0, 0);
  await command("verify");
  assert.equal(process.exitCode || 0, 0);
  assert.equal((await target.query(`SELECT "passwordHash" FROM "AdminUser"`)).rows[0].passwordHash, "pbkdf2_sha256$120000$salt$unchanged");
  await command("import");
  assert.equal(process.exitCode, 1, "nonempty imports must fail");
  process.exitCode = 0;
  assert.equal((await target.query(`SELECT count(*)::int AS n FROM "Project"`)).rows[0].n, 1);
  await target.exec(`UPDATE "Project" SET title='changed' WHERE id='old-project'`);
  await command("verify");
  assert.equal(process.exitCode, 1, "row mismatches must fail");
  process.exitCode = 0;
  console.log("DATABASE_TRANSFER_TEST_PASSED");
} finally {
  await source.close(); await target.close();
  if (directory.startsWith(path.join(tmpdir(), "portfolio-database-test-"))) await rm(directory, { recursive: true, force: true });
}
