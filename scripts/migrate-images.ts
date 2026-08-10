import "dotenv/config";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  isS3Configured,
  getPublicUrl,
  isOwnS3Url,
  putObject,
} from "../src/lib/s3";
import { isValidImageFilename } from "../src/lib/storage";

const UPLOADS_DIR = path.join(process.cwd(), "data", "uploads");

async function main() {
  if (!isS3Configured()) {
    throw new Error("S3 is not configured. Set S3_* env vars first.");
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  const projects = await prisma.project.findMany({
    where: { image: { not: null } },
    select: { id: true, name: true, image: true },
  });

  let migrated = 0;
  let skippedS3 = 0;
  let skippedExternal = 0;
  let missing = 0;

  for (const project of projects) {
    const image = project.image!;
    if (isOwnS3Url(image)) {
      skippedS3++;
      continue;
    }
    if (/^https?:\/\//.test(image)) {
      skippedExternal++;
      continue;
    }
    if (!isValidImageFilename(image)) {
      console.warn(`[skip] ${project.name}: invalid image value "${image}"`);
      skippedExternal++;
      continue;
    }

    const filePath = path.join(UPLOADS_DIR, image);
    let buffer: Buffer;
    try {
      buffer = await readFile(filePath);
    } catch {
      console.warn(`[missing] ${project.name}: ${image} not found on disk`);
      missing++;
      continue;
    }

    const ext = image.split(".").pop()?.toLowerCase() ?? "";
    const key = `uploads/${image}`;
    const contentType =
      ext === "svg"
        ? "image/svg+xml"
        : ext === "jpg"
          ? "image/jpeg"
          : `image/${ext}`;

    await putObject(key, buffer, contentType);
    const url = getPublicUrl(key);
    await prisma.project.update({
      where: { id: project.id },
      data: { image: url },
    });

    console.log(`[migrated] ${project.name}: ${image} -> ${url}`);
    migrated++;
  }

  const files = await readdir(UPLOADS_DIR).catch(() => [] as string[]);
  const referenced = new Set(
    projects
      .filter((p) => isValidImageFilename(p.image ?? ""))
      .map((p) => p.image)
  );
  const orphans = files.filter((f) => !referenced.has(f));
  for (const file of orphans) {
    const filePath = path.join(UPLOADS_DIR, file);
    const buffer = await readFile(filePath);
    const key = `uploads/${file}`;
    const ext = file.split(".").pop()?.toLowerCase() ?? "";
    const contentType =
      ext === "svg" ? "image/svg+xml" : ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    await putObject(key, buffer, contentType);
    console.log(`[orphan] ${file} -> ${getPublicUrl(key)}`);
  }

  console.log(
    `\nDone. migrated=${migrated} alreadyS3=${skippedS3} external=${skippedExternal} missingOnDisk=${missing} orphanUploaded=${orphans.length}`
  );
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
