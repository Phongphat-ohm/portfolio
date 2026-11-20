# Supabase migration and operations

## Architecture and required access

Next.js remains the API/auth boundary; Prisma connects to Supabase Postgres. Storage
uses a private `portfolio-files` bucket and a server-only secret key. Browser code
does not receive a Supabase key. Existing usernames, hashes, IDs and cookie format
are preserved. Keep AUTH_SECRET unchanged during cutover.

Use Node >=22 and Bun 1.3.11 or newer. Supabase SDK is pinned to 2.119.2. CLI stable
was 3.2.0 when checked on 2026-11-20; it is not required by these transfer scripts.
If using CLI, pin a reviewed stable version and inspect its `--help` first: v3
defaults to local targets and requires explicit remote selection for hosted work.
Do not use Supabase CLI migrations alongside Prisma for the application's schema.

Supabase access, source database connectivity, target project refs, region, plan,
off-site backup destination, alert destination and hosting secrets must be supplied
before the hosted steps can run. Never paste passwords into command arguments or
commit .env files, backups, manifests or database exports.

Create separate staging and production Cloud projects with the latest stable
PostgreSQL available in the region nearest the Next.js host. Record the actual
version, project ref, region, quota, upload limit and connection limit in the
deployment record. Disable the Data API in the dashboard; test Storage afterward.
Use scoped management tokens, not account-wide tokens, for CLI/CI/MCP.

## Environment and permissions

Copy `.env.example` to a private environment file and replace placeholders.
`DATABASE_URL` is the `portfolio_app` runtime user via transaction pooler (6543).
`DIRECT_URL` and `TARGET_DATABASE_URL` are the migration user via session pooler
(5432), or a direct connection where IPv6 is supported. Preserve verified TLS;
never resolve certificate problems by disabling certificate verification.
`PrismaPg` uses a default maximum of 3 connections per process, configurable via
DATABASE_POOL_MAX. Budget connections across all instances, workers and builds.

`SUPABASE_SECRET_KEY` is the new `sb_secret_...` key, never NEXT_PUBLIC_. Keep source
SFTPGo credentials in the migration environment only; the new runtime never uses
SFTPGo. Existing ADMIN_USERNAME/ADMIN_PASSWORD fallback is retained for compatibility;
prefer existing AdminUser rows. Production AUTH_SECRET must be set to a real secret.

Prisma migrations create the NOLOGIN `portfolio_runtime` group, enable RLS on five
application tables, revoke PUBLIC/anon/authenticated table grants, and grant:

| Table | Runtime access |
| --- | --- |
| AdminUser | SELECT for password verification |
| Project, Certificate, UploadedFile | SELECT/INSERT/UPDATE/DELETE |
| StorageCleanupJob | SELECT/INSERT/UPDATE/DELETE |

RLS policies target the runtime group, not Supabase Auth users. Per-user admin
authorization remains in Next.js. The runtime login must not own tables, inherit
an owner role, have schema CREATE, BYPASSRLS, superuser, or role-management rights.
Run `admin:create` only with the migration connection (DIRECT_URL), not runtime
permissions. RLS is not a replacement for the custom session guard.

## Rehearsal: database and source file backup

Run these from the repository root in PowerShell after loading the private source
environment. Paths below must be outside the repository, on an encrypted volume
with access limited to operators. On Windows restrict the folder ACL explicitly;
POSIX mode flags alone do not enforce Windows ACLs.

```powershell
bun install --frozen-lockfile
bun run prisma:generate
bun run db:transfer inventory C:/secure-backups/portfolio/rehearsal
bun run db:transfer export C:/secure-backups/portfolio/rehearsal
bun run storage:migrate backup-sftp C:/secure-backups/portfolio/rehearsal
```

SOURCE_DATABASE_URL must point at the old database with read-only access to the
four application tables, migrations and catalog. `inventory.json` captures column
types/defaults, indexes, constraints, migration history, counts, file sizes and
database version. Compare it against `prisma/schema.prisma` and the initial migration
before creating the target. Stop for missing tables, unexpected columns, failed
migrations, provider types other than sftpgo, missing files or unsupported symlinks.
Check external imageUrl values separately; external website images are not objects
owned by this application's Storage and are preserved as URLs.

`database.json` contains password hashes and private records; it is secret backup
material. `database.sha256` detects accidental corruption. Timestamps without time
zones are transferred as raw PostgreSQL strings to avoid timezone shifts.

File backup recursively lists SFTPGo's configured root, downloads every tracked file
(also outside the root if explicitly referenced by the database), includes untracked
files below the root, and writes file-inventory.json with duplicate-content groups.
Tracked objects become `migrated/{id}/{safeFilename}`. Untracked objects become
`unreferenced/{sha256(oldPath)}/{safeFilename}` and have no public metadata row.
Files are streamed to disk and checksummed. No MIME or 10 MiB restriction is applied
to historical files. Missing/oversized files must be reconciled, never skipped.

Each snapshot is immutable: for final cutover take a NEW directory after freezing
writes, so added/changed/deleted files cannot be missed by resuming an old manifest.
Resume only the exact same frozen snapshot. Run one process per directory. A lock
file prevents concurrent manifest writes; after a crash, verify no process remains
before removing `files.lock` manually. Do not edit manifest entries to bypass errors.

## Prepare and restore staging

Configure staging TARGET_DATABASE_URL, DIRECT_URL and Supabase URL/key. Inspect
source schema and history before applying migrations; never mark migrations applied
without verifying the corresponding SQL already exists. Do not restore system schemas
(`auth`, `storage`) or overwrite Supabase roles with a whole-database dump.

```powershell
bun run prisma:deploy
bun run storage:provision
$env:CONFIRM_TARGET_IMPORT = 'true'
bun run db:transfer import C:/secure-backups/portfolio/rehearsal
$env:CONFIRM_STORAGE_WRITE = 'true'
bun run storage:migrate migrate C:/secure-backups/portfolio/rehearsal
bun run storage:migrate verify C:/secure-backups/portfolio/rehearsal
bun run db:transfer verify C:/secure-backups/portfolio/rehearsal
```

Provisioning needs RUNTIME_DATABASE_PASSWORD (at least 24 random characters), creates
or updates the `portfolio_app` login, grants group membership and rejects excessive
privileges. Use this login in DATABASE_URL. It creates the bucket idempotently but
rejects public buckets or existing bucket MIME/size restrictions. Runtime enforces
new-upload limits; Cloud project upload limits must accommodate ALL historical files.
Bucket configuration does not raise the project's own upload limit.

Import requires empty application tables and is atomic. Re-running an import into
nonempty tables is refused. If an interrupted command committed, run verify before
deciding whether to create a fresh target. File upload never overwrites existing
objects: matching content resumes, conflicting content aborts. Metadata changes only
after remote SHA-256 and size verification; updatedAt is preserved. The manifest is
bound to one Supabase URL/bucket. Use separate backup directories for each target.

Verify all original rows byte-for-byte except intentional file key/provider changes,
including IDs, hashes, arrays, timestamps and relations. Keep successful database and
storage verification reports with the deployment record.

## Acceptance and production cutover

Run `bun run lint`, `bun test tests` and `bun run build`. Tests include an embedded
PostgreSQL engine (PGlite) for migration/RLS checks and HTTP mocks for transfers;
they do not replace a real Supabase staging rehearsal, pooler test or advisor review.

On staging verify original admin login/session, expiration/logout, wrong credentials,
non-admin rejection, Project/Certificate CRUD, sorting, featured and published state.
Verify old file URLs, legacy imageUrl-only references, PDF/download filenames, shared
references, and unpublish -> next request 404. Draft, GENERAL and unreferenced files
must remain inaccessible to anonymous users. Anonymous callers must not be able to
list/upload/delete Storage objects or read AdminUser directly. Test Data API-disabled
Storage, RLS, malformed uploads, oversized uploads, DB/Storage failures and cleanup.
Inspect browser bundles, JSON and logs for secrets. Run Supabase security/performance
advisors and fix findings before production.

1. Deploy ONLY the standalone `src/proxy.ts` maintenance guard to the SOURCE release,
   retaining its old database and SFTPGo handlers. Do not deploy the new Storage
   handlers until switching the environment to Supabase. Set
   MAINTENANCE_READ_ONLY=true on every serving instance and pause cleanup/other writers.
   Verify POST/PUT/DELETE and login return 503. Public GET remains available.
2. Take a fresh final database+SFTP backup directory. Check it reflects the final
   frozen snapshot. Do not use a rehearsal snapshot as the final data source.
3. Repeat target migration/provision/import/file migration/verification on production,
   using the production environment and a separate final directory. Both verification
   commands must pass with no missing files/checksum mismatches.
4. Switch Next.js to production DATABASE_URL and Supabase Storage secrets, preserving
   AUTH_SECRET. Keep MAINTENANCE_READ_ONLY=true; deploy and verify public reads.
5. Test admin reads using an existing signed session. Then enable writes in a controlled
   smoke-test interval and verify login, CRUD, uploads, PDF and old URLs. Pause again
   immediately if checks fail; preserve any writes made during this interval.
6. Run `bun run ops:check` with runtime credentials. Record version, quotas, connection
   usage, advisor findings and elapsed time. Open writes and monitor service errors.

Do not cut over until data is complete, access controls pass and both DB+file restore
have been rehearsed within the RTO target. Retain source database/SFTPGo and encrypted
backups for at least 14 days after a successful cutover and restore rehearsal.

## Rollback and restore

Before any writes reach Supabase: switch deployment and environment to the preserved
source system. Its data is still the final frozen snapshot. Restore writes only after
the source's login/read/upload smoke tests pass.

After Supabase has accepted writes: NEVER simply point back at the old source. Freeze
all writers and cleanup, export the latest database and back up Storage first. Use
the new backend-compatible deployment while investigating, or restore into a fresh
Supabase replacement project. A full reverse move to SFTPGo requires reconciling
new/deleted rows, mapping every new file back into SFTPGo and verifying the result;
these tools intentionally do not overwrite a nonempty source automatically.

For a database+Storage restore drill, copy the complete backup to a new external
directory, provision a fresh target project and empty schema, import database.json,
then restore files with the NEW target's Storage configuration:

```powershell
bun run prisma:deploy
bun run storage:provision
$env:CONFIRM_TARGET_IMPORT = 'true'
bun run db:transfer import C:/secure-backups/portfolio/restore-drill
$env:CONFIRM_STORAGE_WRITE = 'true'
bun run storage:migrate restore-supabase C:/secure-backups/portfolio/restore-drill
bun run storage:migrate verify C:/secure-backups/portfolio/restore-drill
bun run db:transfer verify C:/secure-backups/portfolio/restore-drill
```

Operational backups preserve object keys, so no metadata rewrite is needed. When
restoring an SFTPGo migration snapshot instead, use `migrate` to rewrite legacy keys;
the original migration manifest's target binding requires a fresh copy with its
target/bucket binding deliberately cleared for this NEW target before starting.
Never reuse a directory that is still being written to. Do not restore _prisma_migrations
from the source; target migration history is maintained by `prisma:deploy`.

## Backups, cleanup and monitoring

Database backups provided by Supabase do not include object bytes. Configure daily
encrypted off-site backups of BOTH database and Storage, retention >=14 days, and
quarterly restore drills. Initial targets: RPO <=24h and RTO <=4h, measured in a real
drill rather than assumed. Schema/role configuration lives in Git; custom role
passwords live in the secret manager and must be reprovisioned after restore.

`bun run ops:backup` creates a timestamped directory under BACKUP_ROOT and calls the
database export plus `backup-supabase`. Set BACKUP_DATABASE_URL to a separate backup
reader. BACKUP_ROOT must be an off-site encrypted mount or copied to one by the backup
system. Configure the hosting scheduler to set read-only on ALL web instances, wait
for in-flight mutations to finish, pause cleanup, run this command with
MAINTENANCE_READ_ONLY=true, verify `backup-complete.json`, then unfreeze in a finally
step. Setting the variable only on the backup process does NOT freeze the website.
No hosting scheduler or off-site credentials are configured by this repository.

Schedule `bun run storage:cleanup` every 5 minutes outside maintenance. Upload intents
become eligible after one hour; retries back off up to 24 hours. The worker checks
for a committed UploadedFile reference before deleting. A reference protects the
object even if a DB response was lost. Never delete all unattached files blindly;
legacy/unreferenced backup objects are intentionally private and retained.

Run `bun run ops:check` on a scheduler and alert on nonzero exit, pending cleanup,
private-bucket violations or legacy providers. Also configure external alerts for
API/Storage 5xx, latency, pool saturation, backup age >24h, storage and egress quota.
Alert destinations, backup schedules, paid plan/PITR and quotas need actual Cloud and
hosting access; they are not provisioned by merely running a local health check.

## References

- [Prisma and Supabase](https://supabase.com/docs/guides/database/prisma)
- [Private buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)
- [Storage access control](https://supabase.com/docs/guides/storage/security/access-control)
- [API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Backup limitations](https://supabase.com/docs/guides/platform/backups)
- [CLI v3 changes](https://supabase.com/changelog/supabase-cli-v3)
