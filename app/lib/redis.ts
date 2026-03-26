import { createClient, RedisClientType } from "redis";
import { RedisGameData } from "./types";

const globalForRedis = global as unknown as { redis: RedisClientType };

export const redis =
  globalForRedis.redis ||
  createClient({
    url: process.env.REDIS_URL,
  });

if (!globalForRedis.redis) {
  globalForRedis.redis = redis;
}

redis.on("error", (err) => {
  console.error("Redis Client Error", err);
});

if (!redis.isReady) {
  redis.connect().catch(console.error);
}

export async function fetchGame(gameKey: string): Promise<RedisGameData | null> {
  const data = await redis.get(gameKey);
  return data ? JSON.parse(data) : null;
}

export async function fetchGameWithUnwatch(gameKey: string): Promise<RedisGameData | null> {
  const data = await redis.get(gameKey);
  if (!data) {
    await redis.unwatch();
  }
  return data ? JSON.parse(data) : null;
}

export async function publishGameUpdate(gameId: string, type: string, data: Record<string, unknown>) {
  await redis.publish(
    `game:${gameId}:updates`,
    JSON.stringify({ type, ...data }),
  );
}

export function buildGameKey(gameId: string): string {
  return `game:${gameId}`;
}

export type { RedisClientType };
