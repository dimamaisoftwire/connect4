import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { redis, buildGameKey } from "@/app/lib/redis";
import { generateSecret, hashSecret } from "@/app/lib/playerAuth";
import { initializeBoard } from "@/app/lib/gameLogic";
import { RedisGameData } from "@/app/lib/types";

const GAME_TTL_SECONDS = 24 * 60 * 60;

function checkRedisConfig(): boolean {
  return !!process.env.REDIS_URL;
}

async function createGameData(): Promise<{ gameData: RedisGameData; gameId: string; playerSecret: string }> {
  const gameId = nanoid(10);
  const playerSecret = generateSecret();
  const playerId = await hashSecret(playerSecret);

  const gameData: RedisGameData = {
    gameStatus: {
      board: initializeBoard(7, 6),
      state: "idle",
      currentPlayer: 1,
    },
    player1Id: playerId,
    player2Id: null,
  };

  return { gameData, gameId, playerSecret };
}

async function saveGame(key: string, gameData: RedisGameData) {
  await redis.setEx(key, GAME_TTL_SECONDS, JSON.stringify(gameData));
}

export async function POST(request: NextRequest) {
  if (!checkRedisConfig()) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 500 });
  }

  const { gameData, gameId, playerSecret } = await createGameData();
  await saveGame(buildGameKey(gameId), gameData);

  return NextResponse.json({ gameId, playerSecret, playerNumber: 1 }, { status: 201 });
}
