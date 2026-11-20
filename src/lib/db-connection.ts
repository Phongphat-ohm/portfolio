import path from "node:path";

export function databaseConnectionString(connectionString: string) {
  const url = new URL(connectionString);
  if (url.hostname.endsWith(".supabase.com") || url.hostname.endsWith(".supabase.co")) {
    // Supabase uses its own CA for Postgres. Trust the official CA, verify the
    // hostname, and never downgrade to rejectUnauthorized:false.
    url.searchParams.set("sslmode", "verify-full");
    url.searchParams.set("sslrootcert", process.env.DATABASE_SSL_CA_FILE || path.join(process.cwd(), "config/certs/supabase-ca-2021.crt"));
  }
  return url.toString();
}
