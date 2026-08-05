import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("[prisma] DATABASE_URL is not set. Database queries will fail.");
}

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 10_000,
  query_timeout: 15_000,
  statement_timeout: 15_000,
  idleTimeoutMillis: 30_000,
  max: 10,
});

pool.on("error", (err) => {
  console.error("[prisma][pool] idle client error:", err.message);
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
