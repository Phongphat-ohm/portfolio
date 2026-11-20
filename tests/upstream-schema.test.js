import { expect, test } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";

test("upstream migrations plus Supabase additions preserve users, projects and visit counts", async () => {
  const db = new PGlite();
  try {
    await db.exec("CREATE ROLE anon; CREATE ROLE authenticated;");
    for (const migration of ["20260805142549_init", "20260806112424_add_daily_visit"]) await db.exec(await readFile(`prisma/migrations/${migration}/migration.sql`, "utf8"));
    await db.exec(`INSERT INTO "User" (id,username,"passwordHash","updatedAt") VALUES ('source-user','admin','$2b$10$unchanged-hash',now()); INSERT INTO "Project" (id,name,description,year,status,tags,categories,"updatedAt") VALUES ('source-project','Source','Original','2026','in-progress',ARRAY['Next.js'],ARRAY['Web'],now()); INSERT INTO "DailyVisit" (id,date,count,"updatedAt") VALUES ('day','2026-11-19',123,now());`);
    await db.exec(await readFile("prisma/migrations/20261120120000_supabase_integration/migration.sql", "utf8"));
    expect((await db.query(`SELECT "passwordHash" FROM "User"`)).rows[0].passwordHash).toBe("$2b$10$unchanged-hash");
    const project = (await db.query(`SELECT name,status,tags,categories,published FROM "Project"`)).rows[0];
    expect(project).toEqual({ name: "Source", status: "in-progress", tags: ["Next.js"], categories: ["Web"], published: true });
    expect((await db.query(`SELECT count FROM "DailyVisit"`)).rows[0].count).toBe(123);
    await db.exec("SET ROLE portfolio_runtime");
    expect((await db.query(`SELECT count(*)::int AS n FROM "User"`)).rows[0].n).toBe(1);
    await expect(db.exec(`UPDATE "User" SET "passwordHash"='changed'`)).rejects.toThrow();
    await db.exec(`UPDATE "DailyVisit" SET count=124; RESET ROLE; SET ROLE anon;`);
    await expect(db.query(`SELECT * FROM "User"`)).rejects.toThrow();
  } finally { await db.close(); }
}, 30000);
