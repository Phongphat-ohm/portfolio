import { expect, test } from "bun:test";

test("Prisma imports without build-time credentials and still validates credentials on first use", async () => {
  const child = Bun.spawn([process.execPath, "tests/fixtures/prisma-initialization.js"], {
    stdout: "pipe", stderr: "pipe",
    env: { ...process.env, NODE_ENV: "test" },
  });
  const [stdout, stderr, code] = await Promise.all([
    new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited,
  ]);
  if (code !== 0) throw new Error(`Prisma initialization regression: ${stderr}`);
  expect(stdout).toContain("PRISMA_IMPORT_WITHOUT_DATABASE_URL_OK");
  expect(stdout).toContain("MISSING_RUNTIME_DATABASE_URL_REJECTED");
  expect(stdout).toContain("PRISMA_SINGLETON_AND_BOUND_METHODS_OK");
}, 10000);
