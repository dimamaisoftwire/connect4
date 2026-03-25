import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";
import { RedisGameData } from "@/app/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: gameId } = await params;
    const gameKey = `game:${gameId}`;

    const gameDataRaw = await redis.get(gameKey);

    if (!gameDataRaw) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 },
      );
    }

    const gameData: RedisGameData = JSON.parse(gameDataRaw);

    // Return game status without secrets
    return NextResponse.json(
      {
        gameStatus: gameData.gameStatus,
        hasPlayer2: gameData.player2Id !== null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching game state:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch game state: ${message}` },
      { status: 500 },
    );
  }
}
