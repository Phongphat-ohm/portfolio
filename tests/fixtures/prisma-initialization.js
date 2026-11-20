import assert from "node:assert/strict";

// Bun loads .env before this process starts. Clear the database settings in this
// isolated process so this reproduces a Vercel build without database credentials.
delete process.env.DATABASE_URL;
delete process.env.DIRECT_URL;
delete globalThis.prisma;

const { prisma } = await import("../../src/lib/prisma");
console.log("PRISMA_IMPORT_WITHOUT_DATABASE_URL_OK");

assert.throws(() => prisma.project, /DATABASE_URL is required for Prisma/);
console.log("MISSING_RUNTIME_DATABASE_URL_REJECTED");

// Construct the actual client/delegates without issuing queries or opening sockets.
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:1/test";
assert.equal(typeof prisma.project.findMany, "function");
assert.equal(typeof prisma.$transaction, "function");
const cachedClient = globalThis.prisma;
assert.ok(cachedClient);
assert.equal(prisma.project, cachedClient.project);
delete process.env.DATABASE_URL;
assert.equal(prisma.project, cachedClient.project);
await prisma.$disconnect();
console.log("PRISMA_SINGLETON_AND_BOUND_METHODS_OK");
