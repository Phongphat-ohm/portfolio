-- CreateEnum
CREATE TYPE "FileOwnerType" AS ENUM ('CERTIFICATE', 'PROJECT', 'GENERAL');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fileId" TEXT,
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "summary" TEXT;

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "ownerType" "FileOwnerType" NOT NULL DEFAULT 'GENERAL',
    "ownerId" TEXT,
    "filename" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'supabase',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "fileId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UploadedFile_key_key" ON "UploadedFile"("key");

-- CreateIndex
CREATE INDEX "Certificate_published_sortOrder_idx" ON "Certificate"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "Certificate_fileId_idx" ON "Certificate"("fileId");

-- CreateIndex
CREATE INDEX "Certificate_imageUrl_published_idx" ON "Certificate"("imageUrl", "published");

-- CreateIndex
CREATE UNIQUE INDEX "StorageCleanupJob_key_key" ON "StorageCleanupJob"("key");

-- CreateIndex
CREATE INDEX "StorageCleanupJob_nextAttemptAt_idx" ON "StorageCleanupJob"("nextAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_published_featured_sortOrder_idx" ON "Project"("published", "featured", "sortOrder");

-- CreateIndex
CREATE INDEX "Project_fileId_idx" ON "Project"("fileId");

-- CreateIndex
CREATE INDEX "Project_image_published_idx" ON "Project"("image", "published");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "UploadedFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "UploadedFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- This group has no login or DDL rights. Provision a separate LOGIN role and
-- grant membership outside migrations; never commit a database password.
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'portfolio_runtime') THEN
    CREATE ROLE portfolio_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO portfolio_runtime;
GRANT SELECT ON "User", "AdminUser" TO portfolio_runtime;
GRANT SELECT, INSERT, UPDATE, DELETE ON "Project", "Certificate", "UploadedFile", "StorageCleanupJob", "DailyVisit" TO portfolio_runtime;

DO $$ DECLARE tbl text; api_role text; BEGIN
  FOREACH tbl IN ARRAY ARRAY['User','AdminUser','Project','Certificate','UploadedFile','StorageCleanupJob','DailyVisit'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC', tbl);
    FOREACH api_role IN ARRAY ARRAY['anon','authenticated'] LOOP
      IF EXISTS (SELECT FROM pg_roles WHERE rolname=api_role) THEN
        EXECUTE format('REVOKE ALL ON public.%I FROM %I', tbl, api_role);
      END IF;
    END LOOP;
    -- Custom username/session authorization occurs in the trusted Next.js API.
    -- These policies apply ONLY to its restricted database role, never to API users.
    IF tbl IN ('AdminUser','User') THEN
      EXECUTE format('CREATE POLICY portfolio_server ON public.%I FOR SELECT TO portfolio_runtime USING (true)', tbl);
    ELSE
      EXECUTE format('CREATE POLICY portfolio_server ON public.%I FOR ALL TO portfolio_runtime USING (true) WITH CHECK (true)', tbl);
    END IF;
  END LOOP;
END $$;
