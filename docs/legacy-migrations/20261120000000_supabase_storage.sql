-- AlterTable
ALTER TABLE "UploadedFile" ALTER COLUMN "provider" SET DEFAULT 'supabase';

-- CreateTable
CREATE TABLE "StorageCleanupJob" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StorageCleanupJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StorageCleanupJob_key_key" ON "StorageCleanupJob"("key");

-- CreateIndex
CREATE INDEX "StorageCleanupJob_nextAttemptAt_idx" ON "StorageCleanupJob"("nextAttemptAt");

-- CreateIndex
CREATE INDEX "Certificate_fileId_idx" ON "Certificate"("fileId");

-- CreateIndex
CREATE INDEX "Certificate_imageUrl_published_idx" ON "Certificate"("imageUrl", "published");

-- CreateIndex
CREATE INDEX "Project_fileId_idx" ON "Project"("fileId");

-- CreateIndex
CREATE INDEX "Project_imageUrl_published_idx" ON "Project"("imageUrl", "published");

-- This group has no login or DDL rights. Provision a separate LOGIN role and
-- grant membership outside migrations; never commit a database password.
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'portfolio_runtime') THEN
    CREATE ROLE portfolio_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO portfolio_runtime;
GRANT SELECT ON "AdminUser" TO portfolio_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Project", "Certificate", "UploadedFile", "StorageCleanupJob" TO portfolio_runtime;

DO $$ DECLARE tbl text; api_role text; BEGIN
  FOREACH tbl IN ARRAY ARRAY['AdminUser','Project','Certificate','UploadedFile','StorageCleanupJob'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC', tbl);
    FOREACH api_role IN ARRAY ARRAY['anon','authenticated'] LOOP
      IF EXISTS (SELECT FROM pg_roles WHERE rolname=api_role) THEN
        EXECUTE format('REVOKE ALL ON public.%I FROM %I', tbl, api_role);
      END IF;
    END LOOP;
    -- Custom username/session authorization occurs in the trusted Next.js API.
    -- These policies apply ONLY to its restricted database role, never to API users.
    IF tbl = 'AdminUser' THEN
      EXECUTE format('CREATE POLICY portfolio_server ON public.%I FOR SELECT TO portfolio_runtime USING (true)', tbl);
    ELSE
      EXECUTE format('CREATE POLICY portfolio_server ON public.%I FOR ALL TO portfolio_runtime USING (true) WITH CHECK (true)', tbl);
    END IF;
  END LOOP;
END $$;
