import { createStorageClient, storageConfig } from "../lib/storage-client";
import { connect, run } from "./migration/common";

await run(async () => {
  const client = await connect("DATABASE_URL");
  try {
    const role = (await client.query(`SELECT rolname,rolsuper,rolbypassrls,rolcreatedb,rolcreaterole FROM pg_roles WHERE rolname=current_user`)).rows[0];
    const ddl = (await client.query(`SELECT has_schema_privilege(current_user,'public','CREATE') AS allowed`)).rows[0].allowed;
    if (role.rolsuper || role.rolbypassrls || role.rolcreatedb || role.rolcreaterole || ddl) throw new Error("Runtime role has excessive permissions.");
    const security = (await client.query(`SELECT c.relname,c.relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=ANY($1)`, [["User", "AdminUser", "UploadedFile", "Project", "Certificate", "StorageCleanupJob", "DailyVisit"]])).rows;
    if (security.length !== 7 || security.some((row) => !row.relrowsecurity)) throw new Error("Runtime tables are missing RLS.");
    const leaked = (await client.query(`SELECT c.relname,r.rolname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace CROSS JOIN pg_roles r WHERE n.nspname='public' AND c.relname=ANY($1) AND r.rolname IN ('anon','authenticated') AND (has_table_privilege(r.oid,c.oid,'SELECT') OR has_table_privilege(r.oid,c.oid,'INSERT') OR has_table_privilege(r.oid,c.oid,'UPDATE') OR has_table_privilege(r.oid,c.oid,'DELETE'))`, [["User", "AdminUser", "UploadedFile", "Project", "Certificate", "StorageCleanupJob", "DailyVisit"]])).rows;
    if (leaked.length) throw new Error("Runtime tables have unexpected public grants.");
    const legacy = Number((await client.query(`SELECT count(*) AS count FROM "UploadedFile" WHERE provider<>'supabase'`)).rows[0].count);
    const pending = (await client.query(`SELECT count(*) AS count,min("createdAt") AS oldest FROM "StorageCleanupJob" WHERE "nextAttemptAt"<=now()`)).rows[0];
    const { data: bucket, error } = await createStorageClient().storage.getBucket(storageConfig().bucket);
    if (error || !bucket || bucket.public) throw new Error("Bucket health check failed or bucket is public.");
    if (legacy) throw new Error("Runtime still references files not migrated to Supabase.");
    console.log(JSON.stringify({ healthy: true, role: role.rolname, rlsTables: security.length, pendingCleanup: Number(pending.count), oldestCleanup: pending.oldest, checkedAt: new Date().toISOString() }));
    if (Number(pending.count)) process.exitCode = 1;
  } finally { await client.end(); }
});
