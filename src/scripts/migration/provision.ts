import { createStorageClient, storageConfig } from "../../lib/storage-client";
import { connect, required, run } from "./common";

await run(async () => {
  const { bucket } = storageConfig();
  const storage = createStorageClient().storage;
  const { data: buckets, error: listError } = await storage.listBuckets();
  if (listError) throw new Error("Storage bucket listing failed.");
  const existing = buckets.find((item) => item.id === bucket);
  if (existing?.public) throw new Error("Bucket is public; refusing to silently change an existing bucket.");
  // Historical files may have arbitrary MIME/size. Runtime enforces the NEW upload
  // restrictions; the bucket must not reject valid legacy files during migration.
  if (existing && (existing.allowed_mime_types?.length || existing.file_size_limit)) throw new Error("Bucket has upload limits. Reconcile all legacy file sizes/types before migration.");
  if (!existing) {
    const { error } = await storage.createBucket(bucket, { public: false });
    if (error) throw new Error("Storage bucket creation failed.");
  }
  const client = await connect("TARGET_DATABASE_URL");
  try {
    const password = required("RUNTIME_DATABASE_PASSWORD");
    if (password.length < 24) throw new Error("Runtime password must have at least 24 characters.");
    const role = (await client.query("SELECT rolname FROM pg_roles WHERE rolname='portfolio_app'")).rows[0];
    // PostgreSQL role passwords cannot be bind parameters. quote_literal is applied
    // by PostgreSQL, never by string interpolation of user input.
    if (!role) await client.query("CREATE ROLE portfolio_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS INHERIT");
    const literal = (await client.query("SELECT quote_literal($1) AS password", [password])).rows[0].password;
    await client.query(`ALTER ROLE portfolio_app PASSWORD ${literal}`);
    await client.query("GRANT portfolio_runtime TO portfolio_app");
    const checks = (await client.query(`SELECT rolsuper,rolbypassrls,rolcreatedb,rolcreaterole FROM pg_roles WHERE rolname='portfolio_app'`)).rows[0];
    const ddl = (await client.query(`SELECT has_schema_privilege('portfolio_app','public','CREATE') AS allowed`)).rows[0].allowed;
    if (Object.values(checks).some(Boolean) || ddl) throw new Error("Runtime role has excessive privileges. Reconcile role grants before deployment.");
    console.log(JSON.stringify({ bucket, private: true, runtimeRole: "portfolio_app", provisioned: true }));
  } finally { await client.end(); }
});
