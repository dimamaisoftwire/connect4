import { NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";
import { RedisGameData } from "@/app/lib/types";

export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse(data: Record<string, unknown>, status: number = 200) {
  return NextResponse.json(data, { status });
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

export async function publishUpdate(gameId: string, type: string, data: Record<string, unknown>) {
  await redis.publish(
    `game:${gameId}:updates`,
    JSON.stringify({ type, ...data }),
  );
}

export function gameKey(gameId: string): string {
  return `game:${gameId}`;
}
