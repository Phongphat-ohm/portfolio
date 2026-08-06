import { createClient } from "redis";
import type { RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as { redis?: RedisClientType };

function createRedisClient(): RedisClientType {
  const url = process.env.REDIS_URL;
  let client: RedisClientType;
  try {
    client = createClient({ url }) as RedisClientType;
  } catch (err) {
    console.error("[redis] createClient failed, running without Redis:", err);
    client = createClient({ url: undefined }) as RedisClientType;
  }
  client.on("error", (err) => {
    console.error("[redis] error:", err.message);
  });
  if (url) {
    client.connect().catch((err) => {
      console.error("[redis] connect failed:", err.message);
    });
  }
  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
