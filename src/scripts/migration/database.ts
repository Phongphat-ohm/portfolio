import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { canonical, connect, externalDirectory, loadSnapshot, quote, run, saveJson, sha256, tables, type Snapshot } from "./common";

await run(async () => {
  const [command, output] = process.argv.slice(2);
  if (!["inventory", "export", "import", "verify"].includes(command) || !output) throw new Error("Usage: bun run db:transfer inventory|export|import|verify <external-directory>");
  const directory = await externalDirectory(output);
  const source = command === "inventory" || command === "export";
  const client = await connect(source ? "SOURCE_DATABASE_URL" : "TARGET_DATABASE_URL");
  try {
    if (source) {
      await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
      const schema = (await client.query(`SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default, ordinal_position FROM information_schema.columns WHERE table_schema='public' AND table_name=ANY($1) ORDER BY table_name,ordinal_position`, [tables])).rows;
      const indexes = (await client.query(`SELECT tablename,indexname,indexdef FROM pg_indexes WHERE schemaname='public' AND tablename=ANY($1) ORDER BY tablename,indexname`, [tables])).rows;
      const constraints = (await client.query(`SELECT c.relname AS table_name, x.conname, pg_get_constraintdef(x.oid) AS definition FROM pg_constraint x JOIN pg_class c ON c.oid=x.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname=ANY($1) ORDER BY c.relname,x.conname`, [tables])).rows;
      const historyExists = (await client.query(`SELECT to_regclass('public._prisma_migrations') AS name`)).rows[0].name;
      const migrations = historyExists ? (await client.query(`SELECT migration_name,checksum,finished_at,rolled_back_at FROM public._prisma_migrations ORDER BY migration_name`)).rows : [];
      const rows = {} as Snapshot["rows"];
      for (const table of tables) rows[table] = (await client.query(`SELECT * FROM public.${quote(table)} ORDER BY id`)).rows;
      const databaseVersion = (await client.query("SELECT version() AS version")).rows[0].version;
      await client.query("COMMIT");
      const report = { capturedAt: new Date().toISOString(), databaseVersion, schema, indexes, constraints, migrations, counts: Object.fromEntries(tables.map((table) => [table, rows[table].length])), fileBytes: rows.UploadedFile.reduce((sum, file) => sum + Number(file.size), 0) };
      await saveJson(path.join(directory, "inventory.json"), report);
      if (command === "export") {
        await saveJson(path.join(directory, "database.json"), { version: 1, ...report, rows });
        await writeFile(path.join(directory, "database.sha256"), sha256(await readFile(path.join(directory, "database.json"))) + "\n", { mode: 0o600 });
      }
      console.log(JSON.stringify({ command, counts: report.counts, fileBytes: report.fileBytes }));
      return;
    }
    const snapshot = await loadSnapshot(directory);
    if (command === "import") {
      if (process.env.CONFIRM_TARGET_IMPORT !== "true") throw new Error("Target import requires CONFIRM_TARGET_IMPORT=true and an empty target.");
      await client.query("BEGIN");
      try {
        for (const table of tables) await client.query(`LOCK TABLE public.${quote(table)} IN ACCESS EXCLUSIVE MODE`);
        for (const table of tables) {
          if (Number((await client.query(`SELECT count(*) AS n FROM public.${quote(table)}`)).rows[0].n)) throw new Error("Target tables must be empty. Import into a new target, never overwrite live data.");
          for (const row of snapshot.rows[table]) {
            const fields = Object.keys(row);
            await client.query(`INSERT INTO public.${quote(table)} (${fields.map(quote).join(",")}) VALUES (${fields.map((_, index) => `$${index + 1}`).join(",")})`, Object.values(row));
          }
        }
        await client.query("COMMIT");
      } catch (error) { await client.query("ROLLBACK"); throw error; }
    }
    // A verified Storage manifest accounts for intentional key/provider changes only.
    let manifest: { entries: { fileId?: string; newKey: string; status: string }[] } | undefined;
    try { manifest = JSON.parse(await readFile(path.join(directory, "files.json"), "utf8")); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    for (const table of tables) {
      const actual = (await client.query(`SELECT * FROM public.${quote(table)} ORDER BY id`)).rows;
      const expected = structuredClone(snapshot.rows[table]);
      if (table === "UploadedFile" && manifest) for (const file of expected) {
        const entry = manifest.entries.find((entry) => entry.fileId === file.id && entry.status === "verified");
        if (entry) { file.key = entry.newKey; file.provider = "supabase"; }
      }
      if (canonical(actual) !== canonical(expected)) throw new Error(`Verification mismatch in ${table}.`);
    }
    await client.query("COMMIT");
    await saveJson(path.join(directory, "database-verification.json"), { verifiedAt: new Date().toISOString(), passed: true });
    console.log("Database rows verified, including IDs, passwords, dates and references.");
  } finally { await client.end(); }
});
