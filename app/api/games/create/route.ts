import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { redis } from "@/app/lib/redis";
import { generateSecret, hashSecret, initializeBoard } from "@/app/lib/gameUtils";
import { RedisGameData } from "@/app/lib/types";
import { errorResponse, successResponse, gameKey } from "../_utils";

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
    return errorResponse("Redis not configured", 500);
  }

  const { gameData, gameId, playerSecret } = await createGameData();
  await saveGame(gameKey(gameId), gameData);

  return successResponse({ gameId, playerSecret, playerNumber: 1 }, 201);
}
