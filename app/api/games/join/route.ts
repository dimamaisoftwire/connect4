import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";
import {
  generateSecret,
  hashSecret
} from "@/app/lib/gameUtils";
import { RedisGameData } from "@/app/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: "Missing gameId" },
        { status: 400 },
      );
    }

    const gameKey = `game:${gameId}`;
    const gameDataRaw = await redis.get(gameKey);

    if (!gameDataRaw) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 },
      );
    }

    const gameData: RedisGameData = JSON.parse(gameDataRaw);

    if (gameData.player2Id !== null) {
      return NextResponse.json(
        { error: "Game is full" },
        { status: 409 },
      );
    }

    const playerSecret = generateSecret();
    const playerId = await hashSecret(playerSecret);

    gameData.player2Id = playerId;
    gameData.gameStatus.state = "ongoing";

    await redis.set(gameKey, JSON.stringify(gameData));

    // Publish update for SSE subscribers
    await redis.publish(
      `game:${gameId}:updates`,
      JSON.stringify({
        type: "playerJoined",
        gameStatus: gameData.gameStatus,
      }),
    );

    return NextResponse.json(
      {
        gameId,
        playerSecret,
        playerNumber: 2,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error joining game:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to join game: ${message}` },
      { status: 500 },
    );
  }
}
