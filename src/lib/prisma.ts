import { PrismaPg } from "@prisma/adapter-pg";
import { databaseConnectionString } from "./db-connection";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required for Prisma.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseConnectionString(connectionString),
      max: Math.max(1, Number(process.env.DATABASE_POOL_MAX || 3)),
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 10_000,
    }),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
