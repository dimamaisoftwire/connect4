import { createClient, RedisClientType } from "redis";

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
