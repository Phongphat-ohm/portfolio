# Portfolio

Next.js 16 portfolio with a Prisma-backed Supabase PostgreSQL database, private
Supabase Storage, and the upstream bcrypt/JWT admin authentication and Redis visitor analytics.

## Local setup

Use Node.js 22+ and Bun. Copy .env.example to a private .env file and configure the
runtime/migration database connections and server-only Supabase Storage secret.
Preserve both AUTH_SECRET and JWT_SECRET during cutover. Postgres TLS uses the official bundled Supabase CA.

```powershell
bun install --frozen-lockfile
bun run prisma:generate
bun run dev
```

Apply reviewed migrations with `bun run prisma:deploy` against DIRECT_URL, then
provision Storage and the runtime database login with `bun run storage:provision`.
Do not apply these changes to the old source database before exporting its data.

## Validation

```powershell
bun run lint
bun test tests
bun run build
```

Tests cover private file access, publication changes, existing sessions/hashes,
upload failure handling, PostgreSQL RLS/permissions, and resumable file transfers.
Live Supabase/pooler/backup verification requires a connected staging project.

## Migration and operations

See [the Supabase runbook](docs/SUPABASE_RUNBOOK.md) for source inventory, encrypted
backups, schema reconciliation, staging/production migration, rollback, restore,
cleanup scheduling and monitoring. See [verification status](docs/SUPABASE_VERIFICATION.md)
for checks run in this workspace and remaining hosted prerequisites.

- `bun run db:transfer inventory|export|import|verify <external-directory>`
- `bun run storage:migrate backup-sftp|migrate|verify|backup-supabase|restore-supabase <external-directory>`
- `bun run storage:migrate-s3 backup|migrate|verify <external-directory>`
- `bun run storage:cleanup`
- `bun run ops:check`
- `bun run ops:backup`

Keep backups/manifests outside the repository. Production writes can be paused with
MAINTENANCE_READ_ONLY=true while public reads continue. New uploads accept JPEG,
PNG, WebP, GIF and PDF up to 10 MiB. Existing /api/files/{id} URLs are retained;
public readers can access only files referenced by published content.
