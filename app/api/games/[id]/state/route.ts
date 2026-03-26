import { NextRequest, NextResponse } from "next/server";
import { fetchGame, buildGameKey } from "@/app/lib/redis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: gameId } = await params;
  const key = buildGameKey(gameId);

  const gameData = await fetchGame(key);
  if (!gameData) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  return NextResponse.json({
    gameStatus: gameData.gameStatus,
    hasPlayer2: gameData.player2Id !== null,
  });
}
