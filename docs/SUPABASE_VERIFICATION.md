# Verification — upstream merge and live Supabase migration, 2026-11-20

## Repository integration

Fetched origin/main through ec882c3, incorporating its 12 newer commits on
codex/supabase-upstream-integration. Pre-merge work is retained on
codex/supabase-before-upstream-merge. No push or hosted website rollout was performed.

The real upstream schema is User/Project/DailyVisit with bcrypt/JWT and S3, rather
than the earlier four-table/SFTPGo draft. The merged schema preserves those upstream
fields, adds file publication/compatibility support, and archives the incompatible
draft initial migrations. Latest dashboard, categories, visitor charts and S3-source
migration coexist with Supabase-only runtime uploads. Redis remains the current cache.

## Live migration results

| Item | Source | Verified target |
| --- | ---: | ---: |
| User accounts, original IDs/password hashes | 1 | 1 |
| Projects, original IDs/fields/timestamps | 11 | 11 |
| DailyVisit rows | 17 | 17 |
| Historical visit total | 77 | 77 |
| Storage objects, including two unreferenced objects | 13 | 13 |
| Source object bytes | 3,495,918 | 3,495,918 |
| Project image links rewritten to checked /api/files URLs | 11 | 11 |

Database comparison passed for every original column, allowing only the documented
image rewrite and additive target columns. Every object passed local and remote
SHA-256/size checks. The source tables were compared again after migration and were
unchanged from the snapshot. Temporary smoke-test projects/files were removed.

Source access used the existing SSH Host alias and local database/Redis forwarding;
no source Docker services or source PostgreSQL records were modified. The source application
service was observed at zero replicas. Redis analytics state was backed up; no
unflushed daily visitor sets were present. Original AUTH_SECRET/JWT_SECRET and admin
settings were preserved. Source credentials were held only in the private .env during migration; they were removed during the subsequent environment cleanup.

Supabase PostgreSQL 17.12 is reached through verified TLS using its official CA.
The restricted portfolio_app connection succeeded via the transaction pooler. All
seven application tables have RLS and no anon/authenticated table grants. The private
bucket contains migrated objects; runtime cleanup has no pending jobs.

## Executed validation

- Frozen Bun install, Prisma generate and schema validation passed.
- TypeScript check and production Next.js build passed.
- 28 automated tests passed (104 assertions), including the real merged migration in
  PGlite, permissions, legacy snapshots, private files and resumable transfer fixtures.
- 19 live HTTP smoke checks passed against the built Next.js app and real Supabase:
  original bcrypt login; wrong password rejection; JWT-only auth/me; latest dashboard;
  11 public projects with upstream/legacy DTO fields; visitor total 77; public image
  streaming/no-store; anonymous orphan denial and admin orphan access; actual upload;
  new file privacy; upstream create/delete; legacy edit; publish/unpublish revocation.
- Database and S3 verification passed again after smoke-test cleanup.
- ops:check passed with portfolio_app, seven RLS tables and zero pending cleanup.

The live HTTP checks themselves passed; their first report write failed because C:
was full. Only task-owned backups were relocated to D: and the report was saved there.
No unrelated user files were deleted. The public CA was obtained over verified HTTPS
and its fingerprint matched the pooler's presented trust chain; application TLS
certificate/hostname validation was not disabled.

## Artifacts and remaining deployment work

Backup/report location (outside Git):
D:/.PHONGPHAT/portfolio/portfolio-migration-backups/portfolio-s3-cutover-20261120

See SUPABASE_RUNBOOK.md for exact commands, permissions and rollback/restore steps.
The .env changes to existing DATABASE_URL and malformed DIRECT_URL were made only
AFTER the user explicitly approved those two changes. Other existing secrets were
preserved. The source endpoint was updated when the user supplied the new S3-backed
system settings. No passwords, tokens or connection-string values are in this report.

A hosted deployment, Supabase advisor review/project-wide Data API settings, scheduled
cleanup/backups, off-site encryption/retention, alert routing and a separate-project
restore drill are not completed. Git changes and live migration do not configure
those services automatically. RPO/RTO targets are not yet measured. The local Redis
forward needs to be replaced by the hosting-reachable Redis URL for deployment.

## Environment cleanup requested after migration

The normal .env and .env.example now retain only 12 application/Prisma settings.
All source-service credentials, temporary provisioning/import flags and backup-only
settings were removed without changing retained values. The backup runner and
ops:backup command were removed. Existing backup artifacts outside Git were kept.
One-off migration tools require a separately supplied environment when needed.
