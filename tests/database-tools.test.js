import { expect, test } from "bun:test";

test("database transfer exports, restores and reconciles rows without overwriting live data", async () => {
  const proc = Bun.spawn([process.execPath, "tests/fixtures/database-transfer.js"], { stdout: "pipe", stderr: "pipe" });
  const [stdout, stderr, code] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text(), proc.exited]);
  if (code !== 0) throw new Error(`Transfer integration failed: ${stdout}\n${stderr}`);
  expect(stdout).toContain("DATABASE_TRANSFER_TEST_PASSED");
  expect(stderr).toContain("Target tables must be empty");
  expect(stderr).toContain("Verification mismatch in Project");
}, 30000);
