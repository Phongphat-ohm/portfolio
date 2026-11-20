import { spawnSync } from "node:child_process";
import path from "node:path";
import { externalDirectory, required, run, saveJson } from "./migration/common";

await run(async () => {
  const root = await externalDirectory(required("BACKUP_ROOT"));
  const directory = path.join(root, new Date().toISOString().replace(/[:.]/g, "-"));
  await externalDirectory(directory);
  if (process.env.MAINTENANCE_READ_ONLY !== "true") throw new Error("Maintenance: freeze writes and pause cleanup for a consistent database+file backup.");
  for (const [script, command] of [["database.ts", "export"], ["files.ts", "backup-supabase"]]) {
    const result = spawnSync(process.execPath, [path.join("src/scripts/migration", script), command, directory], {
      stdio: "inherit", env: { ...process.env, SOURCE_DATABASE_URL: required("BACKUP_DATABASE_URL") },
    });
    if (result.status !== 0) throw new Error("Storage/database backup failed; snapshot is incomplete.");
  }
  await saveJson(path.join(directory, "backup-complete.json"), { completedAt: new Date().toISOString(), database: true, storage: true });
  console.log("Backup complete. Store this directory on the configured off-site encrypted volume.");
});
