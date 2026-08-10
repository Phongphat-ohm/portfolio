import { createClient } from "redis";
import type { RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as { redis?: RedisClientType };

const REDIS_URL = process.env.REDIS_URL;

function createRedisClient(): RedisClientType {
  try {
    return createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => Math.min(retries * 200, 2000),
      },
    }) as RedisClientType;
  } catch (err) {
    console.error("[redis] createClient failed, running without Redis:", err);
    return createClient({ url: undefined }) as RedisClientType;
  }
}

const client = globalForRedis.redis ?? createRedisClient();

client.on("error", (err) => {
  console.error("[redis] error:", err.message);
});

let connectPromise: Promise<unknown> | null = null;
let warnedMissingUrl = false;

function redisTarget(url: string): string {
  try {
    const u = new URL(url);
    return `${u.hostname}:${u.port || 6379}${u.username || u.password ? " (with auth)" : ""}`;
  } catch {
    return url;
  }
}

export function connectRedis(): Promise<unknown> {
  if (!REDIS_URL) {
    if (!warnedMissingUrl) {
      warnedMissingUrl = true;
      console.warn(
        "[redis] REDIS_URL is not set. Analytics will be disabled. Add REDIS_URL to .env or export it in the server environment."
      );
    }
    return Promise.resolve();
  }
  if (client.isOpen) return Promise.resolve();
  if (connectPromise) return connectPromise;
  const target = redisTarget(REDIS_URL);
  console.log(`[redis] connecting to ${target}...`);
  connectPromise = client.connect().catch((err) => {
    console.error(`[redis] connect failed (${target}):`, err.message);
    connectPromise = null;
  });
  return connectPromise;
}

export const redis = client;

if (process.env.NODE_ENV !== "production") globalForRedis.redis = client;
