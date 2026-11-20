# Supabase implementation verification — 2026-11-20

## Completed in the workspace

- Preserved the existing working tree in
  `C:/Users/PHONGPHAT/.codex/backups/portfolio-before-supabase-20261120` before editing.
  This is a CODE snapshot, not a backup of the live database or SFTPGo.
- Added pinned Supabase SDK 2.119.2, server-only integration and lockfile updates.
  Existing Next.js 16.2.6 and Prisma 7.8.0 were not upgraded.
- Added a Prisma migration for the Supabase provider default, cleanup intents,
  lookup indexes, restricted runtime grants, API-role revokes and RLS policies.
  The migration was tested on an embedded PostgreSQL engine, not applied remotely.
- Updated upload/file APIs, admin checks, file metadata projection, maintenance
  guards, database pool settings and admin provisioning connection selection.
- Added resumable source backups, database export/import/reconciliation, file
  transfer/checksum/restore, bucket/role provisioning, cleanup, health and backup tools.
- Documented source guard rollout, cutover, rollback, off-site backups and restoration.

## Executed checks

| Check | Result |
| --- | --- |
| `bun install --frozen-lockfile` | Passed |
| `bunx prisma generate` | Passed |
| `bunx prisma validate` | Passed |
| `bun run lint` | Passed |
| `bun test tests` | 27 passed, 0 failed; 98 assertions |
| `bun run build` | Passed; production Next.js build |
| Browser static bundle scan for Supabase secret key identifiers | No matches |
| `git diff --check` | Passed; existing Windows LF/CRLF notices only |

API tests use mocked persistence/storage and real session hashing/signatures. SQL
tests execute both migrations and role/RLS queries in PGlite. Database-transfer tests
execute export/import/verification SQL using PGlite behind a simulated pg transport,
including timestamp parsing, nonempty-target refusal and mismatch detection.
Storage-tool tests execute the actual CLI/SDK against local HTTP fixtures, exercising
tracked/untracked backups, resume, restore, remote/local checksum failures and
refusal to overwrite conflicting objects. These are not live-cloud tests.

## Live preflight update — 2026-11-20

The user supplied source settings and configured the destination privately in .env.
Only empty settings were filled: SOURCE_DATABASE_URL, the four SFTPGO settings,
TARGET_DATABASE_URL (derived from the configured destination using the session
pooler port), and a generated RUNTIME_DATABASE_PASSWORD. Existing nonempty values
were preserved. No credential values were copied into this report or a memory file.
The supplied AUTH_SECRET and admin settings matched the existing configuration.

| Live check | Result |
| --- | --- |
| Supabase target via session pooler | Connected; PostgreSQL 17.12 |
| Target public schema | No application tables yet |
| Supabase Storage secret | Authenticated successfully |
| portfolio-files bucket | Confirmed empty; changed public -> private and verified |
| Source database on localhost:15432 | ECONNREFUSED; service/tunnel needs to be opened |
| Source SFTPGo endpoint | DNS ENOTFOUND using both HTTP and DNS checks |
| Existing DIRECT_URL | Malformed: DATABASE_POOL_MAX text is attached to the database path; preserved as requested |

Supabase connector tools are not available in this session; the successful live
checks used the configured PostgreSQL connection and Storage SDK directly. Target
credentials alone do not grant Management API access for project-wide settings.

No source records/files have been exported or imported, because the source database
and file endpoint are unreachable. No target migrations, runtime-role provisioning,
production deployment, Supabase advisor review, actual-data reconciliation or
production restore drill has been performed. The source database and SFTPGo data
have not been changed. Do not treat the bucket preparation as a completed migration.

Before running Prisma against the configured target, either repair DIRECT_URL or
temporarily supply the validated TARGET_DATABASE_URL as DIRECT_URL to that process.
The current nonempty DATABASE_URL also uses the privileged migration login; changing
it to the restricted runtime login requires provisioning and updating that existing
value explicitly after the source can be inventoried and migrated.

Daily backup/cleanup/health schedules, off-site encryption/retention, alert routing,
paid plan/quota selection and measured RPO/RTO still require real hosting/Cloud
access. An automatic reverse migration into a nonempty SFTPGo/source database is
not implemented; after new writes, preserve them and follow the runbook's fresh
Supabase replacement/restore procedure instead of blindly switching to stale data.

The code is ready for a connected staging rehearsal. It is not evidence that the
production data has already been migrated. Follow `SUPABASE_RUNBOOK.md` before cutover.
