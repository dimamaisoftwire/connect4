import { NextRequest, NextResponse } from "next/server";
import { redis, fetchGame, publishGameUpdate, buildGameKey } from "@/app/lib/redis";
import { generateSecret, hashSecret } from "@/app/lib/playerAuth";
import { RedisGameData } from "@/app/lib/types";

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
      return NextResponse.json({ error: "Missing gameId" }, { status: 400 });
    }

    const { gameId } = params;
    const key = buildGameKey(gameId);

    const gameData = await fetchGame(key);
    if (!gameData) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (gameData.player2Id !== null) {
      return NextResponse.json({ error: "Game is full" }, { status: 409 });
    }

    const { secret } = await addPlayerToGame(gameData);
    await updateGame(key, gameData);
    await publishGameUpdate(gameId, "playerJoined", { gameStatus: gameData.gameStatus });

    return NextResponse.json({ gameId, playerSecret: secret, playerNumber: 2 });
  } catch (error) {
    console.error("Error joining game:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Failed to join game: ${message}` }, { status: 500 });
  }
}
