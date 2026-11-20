import { Client, types } from "pg";
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, realpath, writeFile } from "node:fs/promises";
import path from "node:path";

export const tables = ["AdminUser", "UploadedFile", "Certificate", "Project"] as const;
export type Row = Record<string, unknown>;
export type Snapshot = { version: 1; capturedAt: string; databaseVersion: string; schema: Row[]; indexes: Row[]; constraints: Row[]; migrations: Row[]; rows: Record<typeof tables[number], Row[]> };
export const sha256 = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");
export const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;

export function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}.`);
  return value;
}

export async function connect(name: string) {
  // Preserve PostgreSQL timestamp-without-time-zone bytes across hosts/timezones.
  types.setTypeParser(1114, (value) => value);
  const client = new Client({ connectionString: required(name), connectionTimeoutMillis: 10_000 });
  await client.connect();
  return client;
}

export async function externalDirectory(input: string) {
  const workspace = await realpath(process.cwd());
  const inside = (target: string) => {
    const relative = path.relative(workspace, target);
    return !relative || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
  };
  if (inside(path.resolve(input))) {
    throw new Error("Backups/manifests must be outside the repository.");
  }
  await mkdir(path.resolve(input), { recursive: true, mode: 0o700 });
  const resolved = await realpath(path.resolve(input));
  if (inside(resolved)) throw new Error("Backups/manifests must be outside the repository.");
  return resolved;
}

export async function saveJson(filename: string, value: unknown) {
  await writeFile(`${filename}.tmp`, JSON.stringify(value, null, 2) + "\n", { mode: 0o600 });
  await rename(`${filename}.tmp`, filename);
}

export async function loadSnapshot(directory: string): Promise<Snapshot> {
  const bytes = await readFile(path.join(directory, "database.json"));
  const digest = (await readFile(path.join(directory, "database.sha256"), "utf8")).trim();
  if (sha256(bytes) !== digest) throw new Error("Snapshot checksum mismatch.");
  const snapshot: Snapshot = JSON.parse(bytes.toString());
  if (snapshot.version !== 1 || tables.some((table) => !Array.isArray(snapshot.rows[table]))) throw new Error("Invalid snapshot.");
  return snapshot;
}

// Postgres returns dates as Date objects; stable serialization also normalizes field order.
export function canonical(value: unknown): string {
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
  return JSON.stringify(value) ?? "null";
}

export async function run(main: () => Promise<void>) {
  try { await main(); } catch (error) {
    // Never print driver errors: connection strings, hashes and row data may be included.
    console.error(error instanceof Error && /^(Missing |Usage:|Snapshot |Invalid snapshot|Backups\/|Verification |Target |Source |Manifest |Bucket |Storage |SFTPGo |File |Unsupported |Maintenance |Runtime )/.test(error.message) ? error.message : "Operation failed. Inspect access, configuration and service health; secrets were withheld.");
    process.exitCode = 1;
  }
}
