import { NextRequest } from "next/server";
import { redis } from "@/app/lib/redis";
import { generateSecret, hashSecret } from "@/app/lib/gameUtils";
import { RedisGameData } from "@/app/lib/types";
import { errorResponse, successResponse, fetchGame, publishUpdate, gameKey } from "../_utils";

interface JoinRequest {
  gameId: string;
}

async function parseRequest(request: NextRequest): Promise<JoinRequest | null> {
  try {
    const body = await request.json();
    if (!body.gameId) {
      return null;
    }
    return { gameId: body.gameId };
  } catch {
    return null;
  }
}

async function addPlayerToGame(gameData: RedisGameData): Promise<{ secret: string; id: string }> {
  const secret = generateSecret();
  const id = await hashSecret(secret);
  gameData.player2Id = id;
  gameData.gameStatus.state = "ongoing";
  return { secret, id };
}

async function updateGame(key: string, gameData: RedisGameData) {
  await redis.set(key, JSON.stringify(gameData));
}

export async function POST(request: NextRequest) {
  try {
    const params = await parseRequest(request);
    if (!params) {
      return errorResponse("Missing gameId", 400);
    }

    const { gameId } = params;
    const key = gameKey(gameId);

    const gameData = await fetchGame(key);
    if (!gameData) {
      return errorResponse("Game not found", 404);
    }

    if (gameData.player2Id !== null) {
      return errorResponse("Game is full", 409);
    }

    const { secret } = await addPlayerToGame(gameData);
    await updateGame(key, gameData);
    await publishUpdate(gameId, "playerJoined", { gameStatus: gameData.gameStatus });

    return successResponse({ gameId, playerSecret: secret, playerNumber: 2 });
  } catch (error) {
    console.error("Error joining game:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(`Failed to join game: ${message}`, 500);
  }
}
