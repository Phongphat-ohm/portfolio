import { prisma } from "@/lib/prisma";
import { connectRedis, redis } from "@/lib/redis";

const TIME_ZONE = "Asia/Bangkok";
const DAY_TTL = 48 * 60 * 60;
const FLUSH_LOCK_TTL = 30;
const MAX_TRACKS_PER_MINUTE = 30;

const BOT_PATTERNS = [
  "bot",
  "crawl",
  "spider",
  "slurp",
  "bingpreview",
  "mediapartners",
  "googlebot",
  "bingbot",
  "duckduckbot",
  "baiduspider",
  "yandex",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "pinterest",
  "whatsapp",
  "telegrambot",
  "slackbot",
  "discordbot",
  "headlesschrome",
  "python-requests",
  "curl",
  "wget",
  "node-fetch",
  "go-http-client",
  "semrushbot",
  "ahrefsbot",
  "mj12bot",
  "petalbot",
];

export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_PATTERNS.some((pattern) => ua.includes(pattern));
}

function formatParts(d: Date): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
}

export function todayKey(now = new Date()): string {
  const parts = formatParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function bangkokMidnight(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+07:00`);
}

function keyToDate(key: string): string | null {
  const match = /^visits:(\d{4}-\d{2}-\d{2})$/.exec(key);
  return match ? match[1] : null;
}

export async function trackUniqueVisit(
  visitorId: string,
  ip?: string | null
): Promise<{ counted: boolean }> {
  try {
    await connectRedis();

    if (ip) {
      const rlKey = `rl:track:${ip}`;
      const count = await redis.incr(rlKey);
      if (count === 1) await redis.expire(rlKey, 60);
      if (count > MAX_TRACKS_PER_MINUTE) return { counted: false };
    }

    await flushIfNeeded();

    const key = `visits:${todayKey()}`;
    const added = await redis.sAdd(key, visitorId);
    if (added === 1) await redis.expire(key, DAY_TTL);
    return { counted: added === 1 };
  } catch (err) {
    console.warn("[analytics] track failed:", err);
    return { counted: false };
  }
}

export async function getTodayCount(): Promise<number> {
  try {
    await connectRedis();
    return await redis.sCard(`visits:${todayKey()}`);
  } catch (err) {
    console.warn("[analytics] today count failed:", err);
    return 0;
  }
}

export async function getTotalCount(): Promise<number> {
  try {
    const rows = await prisma.dailyVisit.aggregate({ _sum: { count: true } });
    return (rows._sum.count ?? 0) + (await getTodayCount());
  } catch (err) {
    console.warn("[analytics] total count failed:", err);
    return 0;
  }
}

export async function flushIfNeeded(): Promise<void> {
  try {
    await connectRedis();
    const today = todayKey();
    const lastFlush = await redis.get("analytics:lastFlushDate");
    if (lastFlush === today) return;

    const acquired = await redis.set("analytics:flush:lock", "1", {
      NX: true,
      EX: FLUSH_LOCK_TTL,
    });
    if (!acquired) return;

    try {
      for await (const keys of redis.scanIterator({ MATCH: "visits:*", COUNT: 100 })) {
        for (const key of keys) {
          const dateStr = keyToDate(key);
          if (!dateStr || dateStr >= today) continue;
          const count = await redis.sCard(key);
          if (count > 0) {
            const date = bangkokMidnight(dateStr);
            await prisma.dailyVisit.upsert({
              where: { date },
              create: { date, count },
              update: { count },
            });
          }
          await redis.del(key);
        }
      }
      await redis.set("analytics:lastFlushDate", today);
    } finally {
      await redis.del("analytics:flush:lock");
    }
  } catch (err) {
    console.warn("[analytics] flush failed:", err);
  }
}

export async function getDailyVisits(
  days = 30
): Promise<{ date: string; count: number }[]> {
  await flushIfNeeded();
  const today = todayKey();
  const start = bangkokMidnight(today).getTime() - (days - 1) * 86_400_000;

  const rows = await prisma.dailyVisit.findMany({
    where: { date: { gte: new Date(start) } },
    orderBy: { date: "asc" },
  });
  const map = new Map(rows.map((row) => [todayKey(row.date), row.count]));
  const todayCount = await getTodayCount();

  const result: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(start + i * 86_400_000);
    const key = todayKey(d);
    result.push({ date: key, count: key === today ? todayCount : (map.get(key) ?? 0) });
  }
  return result;
}
