# Supabase migration and operations

## Current architecture

The repository now includes origin/main through ec882c3 (12 upstream commits).
Use the upstream User, Project and DailyVisit schema as the source of truth. User
passwords remain bcrypt and the token cookie remains an HS256 JWT using JWT_SECRET.
The earlier portfolio_session/PBKDF2 format and certificate dashboard remain
supported for compatibility. The merged Project model keeps upstream fields and
adds publication, file references, sorting, featured and optional legacy fields.

Next.js and Prisma remain. PostgreSQL and all source S3 objects now use Supabase.
Redis remains the existing analytics cache; migrating Redis was outside the chosen
Database/Storage scope. Preserve both AUTH_SECRET and JWT_SECRET during deployment.

New uploads use a private Supabase bucket and accept JPEG/PNG/WebP/GIF/PDF <=10 MiB.
The upstream dashboard upload component now uses the checked proxy upload flow;
old S3 presigning returns 410. Existing historical file types are preserved,
including unreferenced files. Public reads require a published Project/Certificate
reference. Shared objects are not deleted when a project/image is detached.

## Migration history and connections

The active Prisma migration sequence is:

1. 20260805142549_init (upstream User and Project)
2. 20260806112424_add_daily_visit
3. 20261120120000_supabase_integration (compatibility models, publication fields,
   file metadata/cleanup, indexes, restricted runtime grants and seven RLS tables)

The earlier four-table draft migrations are archived under docs/legacy-migrations;
never apply them alongside the upstream initial migration. Tests retain these
fixtures to exercise older snapshot handling. Source migration checksums matched
upstream Git blobs; Windows working copies differ only by CRLF/LF endings.

DATABASE_URL uses portfolio_app via transaction pooler port 6543. DIRECT_URL and
TARGET_DATABASE_URL use the migration connection via session pooler port 5432.
DATABASE_POOL_MAX defaults to 3 per process. The runtime has SELECT on User/AdminUser
and CRUD on application content/analytics/cleanup tables, with no table ownership,
schema CREATE, role management or BYPASSRLS. Authorization occurs in the trusted
Next.js routes; API roles anon/authenticated have no application-table grants.

Postgres uses verify-full and the official Supabase CA in
config/certs/supabase-ca-2021.crt. Its SHA-256 fingerprint is
80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA.
The certificate is public and traced into Next.js builds. DATABASE_SSL_CA_FILE can
select another reviewed CA file. Never disable certificate/hostname verification.
The client-to-pooler TLS connection was checked as encrypted and authorized;
pg_stat_ssl on the backend reports the pooler's backend connection instead.

## Repeating the S3 migration into a NEW target

Keep source credentials only in the private .env. URL-encode passwords containing
@ or other reserved characters. SOURCE_DATABASE_URL must reach the actual source;
internal Docker service names require a tunnel from a machine outside that network.
Use SOURCE_S3_* for the legacy S3 service and SUPABASE_* for the destination.

Use Bun 1.3.11+ and Node 22+. bun.lockb is the canonical dependency lockfile; the
upstream npm lockfile was removed to avoid two inconsistent dependency graphs.
Builds do not implicitly execute migrations or seed/reset admin accounts.

Take a NEW immutable snapshot directory outside the repository after freezing all
source writers. The observed source application service had zero replicas during
this migration. Recheck source state before a future cutover; a local maintenance
flag alone does not freeze a separately hosted source deployment.

Commands from the repository root (PowerShell; replace paths/environment):

    bun install --frozen-lockfile
    bun run db:transfer inventory D:/secure-backups/portfolio/final
    bun run db:transfer export D:/secure-backups/portfolio/final
    bun run storage:migrate-s3 backup D:/secure-backups/portfolio/final
    bun run prisma:deploy
    bun run storage:provision
    $env:CONFIRM_TARGET_IMPORT = 'true'
    bun run db:transfer import D:/secure-backups/portfolio/final
    $env:CONFIRM_STORAGE_WRITE = 'true'
    bun run storage:migrate-s3 migrate D:/secure-backups/portfolio/final
    bun run storage:migrate-s3 verify D:/secure-backups/portfolio/final
    bun run db:transfer verify D:/secure-backups/portfolio/final

Inspect inventory.json first: compare columns, enum types, indexes, constraints and
migration history against the upstream baseline. Import refuses nonempty tables.
Never restore a whole Postgres dump over Supabase's auth/storage/system schemas.
The importer preserves all original IDs, hashes, array values and timestamps;
additional target defaults are allowed during verification.

S3 backup paginates every object and preserves unreferenced objects too. Each entry
records source key, target key, size, MIME, SHA-256, project references and status.
Objects stream to disk through the native Node HTTP stream (avoiding a Bun web-stream
adapter stall), then uploads/downloads are checksummed before database references
change. Referenced project images become /api/files/{new-metadata-id}; original
Project/User IDs and updatedAt remain unchanged. General/unreferenced files stay
private. Unsupported external/local image sources stop migration rather than skip.

Resume only the SAME frozen snapshot against its bound target. Source/S3 manifests
are private backup material and must stay out of Git. A lock prevents concurrent
writers; remove a stale lock only after confirming its process is no longer running.
Never overwrite a conflicting existing remote object to force migration through.

## Actual backup and verification artifacts

The completed source snapshot is outside Git at:
D:/.PHONGPHAT/portfolio/portfolio-migration-backups/portfolio-s3-cutover-20261120

It contains database.json + SHA-256, inventory.json, s3-files.json, the 13 source
object bytes, Redis analytics state, database/S3 verification reports, the migration
summary and live HTTP smoke-test results. It was moved from C: after that drive ran
out of space. This is a LOCAL backup; it is not an encrypted off-site backup service.
Restrict filesystem ACLs and arrange off-site encryption/retention separately.
The earlier code-only snapshot is the sibling portfolio-before-supabase-20261120
folder. Local Git branch codex/supabase-before-upstream-merge also retains the
pre-merge implementation. Do not confuse a code snapshot with a data backup.

## Deployment and rollback

The hosted Next.js deployment has NOT been changed or pushed by this work. Before
production rollout, configure its secrets with the restricted runtime URL, correct
migration URL, both unchanged auth secrets, private Storage secret and a Redis URL
reachable FROM THAT HOST. The localhost Redis port used on this workstation depends
on its SSH tunnel and is not a valid URL inside an unrelated deployment container.

For another source cutover, deploy the standalone maintenance guard to the OLD
compatible release first, keep its old storage handlers, freeze all mutations and
wait for requests to drain. Switch to the new deployment only after database/file
verification succeeds. Test original login, dashboard, project CRUD, upload, private
orphans, unpublish revocation and downloads. Run ops:check and review Supabase
security/performance advisors, Data API settings, quotas and connection usage.

Before new target writes, rollback can return to the preserved source. After new
writes, freeze and export the current target first; do not switch to stale source
data. Restore into a fresh compatible Supabase project or reconcile deltas before
any reverse move. These tools do not automatically overwrite a nonempty source.
To restore a migrated operational backup, use database import plus
storage:migrate restore-supabase. For an original S3 snapshot into a replacement
project, copy the backup, deliberately clear its old target binding, run S3 migrate
and both verification commands. Rehearse this on a separate project before relying
on an RTO claim.

## Ongoing operations

- Run bun run storage:cleanup every 5 minutes outside maintenance. Durable intents
  are created BEFORE uploading; jobs wait one hour and check committed references
  before deleting. Failed deletion retries back off up to 24 hours.
- Run bun run ops:check with the runtime connection and alert on nonzero exit,
  pending cleanup, missing RLS, public grants, a public bucket or legacy providers.
- bun run ops:backup exports the database and ALL bucket objects to BACKUP_ROOT.
  Set BACKUP_DATABASE_URL and use a fresh timestamped folder. For a consistent
  snapshot, freeze ALL hosted writers and pause cleanup; setting the environment
  variable only on the backup process is insufficient.
- Arrange daily encrypted off-site database AND object backups, retention >=14 days,
  and measured restore drills. Initial targets remain RPO 24h / RTO 4h. Supabase
  database backups do not contain object bytes.
- Hosting schedules, alert routes, off-site encryption, plan/quota selection, project
  Data API disablement, advisors and a second-project restore drill remain operator
  deployment tasks; they are not automatically configured by this repository.

References: https://supabase.com/docs/guides/database/prisma,
https://supabase.com/docs/guides/platform/ssl-enforcement,
https://supabase.com/docs/guides/storage/security/access-control,
https://supabase.com/docs/guides/platform/backups
