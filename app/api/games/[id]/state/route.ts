import { NextRequest } from "next/server";
import { errorResponse, successResponse, fetchGame, gameKey } from "../../_utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: gameId } = await params;
  const key = gameKey(gameId);

  const gameData = await fetchGame(key);
  if (!gameData) {
    return errorResponse("Game not found", 404);
  }

  return successResponse({
    gameStatus: gameData.gameStatus,
    hasPlayer2: gameData.player2Id !== null,
  });
}
