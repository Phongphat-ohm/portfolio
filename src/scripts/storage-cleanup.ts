import { prisma } from "../lib/prisma";
import { storageBucket } from "../lib/storage-client";
import { run } from "./migration/common";

await run(async () => {
  try {
    if (process.env.MAINTENANCE_READ_ONLY === "true") throw new Error("Maintenance: cleanup is paused.");
    const jobs = await prisma.storageCleanupJob.findMany({ where: { nextAttemptAt: { lte: new Date() } }, orderBy: { nextAttemptAt: "asc" }, take: 100 });
    let failed = 0;
    for (const job of jobs) {
      try {
        const referenced = await prisma.uploadedFile.findUnique({ where: { key: job.key }, select: { id: true } });
        if (!referenced) {
          if (!job.key.startsWith("uploads/")) throw new Error("Unexpected cleanup key.");
          const { error } = await storageBucket().remove([job.key]);
          if (error) throw error;
        }
        await prisma.storageCleanupJob.deleteMany({ where: { id: job.id } });
      } catch {
        failed++;
        await prisma.storageCleanupJob.updateMany({ where: { id: job.id }, data: { attempts: { increment: 1 }, nextAttemptAt: new Date(Date.now() + Math.min(24 * 60, 5 * 2 ** Math.min(job.attempts, 8)) * 60_000) } });
        console.error(JSON.stringify({ event: "storage_cleanup_retry", jobId: job.id }));
      }
    }
    console.log(JSON.stringify({ checked: jobs.length, failed }));
    if (failed) process.exitCode = 1;
  } finally { await prisma.$disconnect(); }
});
