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

let client: PrismaClient | undefined;

function getPrismaClient() {
  if (client) return client;
  client = globalForPrisma.prisma ?? createPrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

// Next.js imports route modules while collecting build metadata. Create the real
// client only when a handler uses it, keeping runtime credential validation intact.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const instance = getPrismaClient();
    const value = Reflect.get(instance, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
