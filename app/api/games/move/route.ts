import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";
import { prisma } from "@/app/lib/prisma";
import { verifyPlayer, makeMove } from "@/app/lib/gameUtils";
import { RedisGameData } from "@/app/lib/types";
import { errorResponse, successResponse, fetchGameWithUnwatch, publishUpdate, gameKey } from "../_utils";

const CONCURRENT_ERROR = "Concurrent modification detected, retry";

interface MoveRequest {
  gameId: string;
  secret: string;
  column: number;
}

async function parseRequest(request: NextRequest): Promise<MoveRequest | null> {
  try {
    const body = await request.json();
    if (!body.gameId || !body.secret || body.column === undefined) {
      return null;
    }
    return { gameId: body.gameId, secret: body.secret, column: body.column };
  } catch {
    return null;
  }
}

async function acquireLock(key: string): Promise<boolean> {
  const result = await redis.watch(key);
  return result === "OK";
}

async function verifyTurn(
  gameData: RedisGameData,
  secret: string,
): Promise<{ valid: false; response: NextResponse } | { valid: true; playerNumber: 1 | 2 }> {
  const { isValid, playerNumber } = await verifyPlayer(
    secret,
    gameData.player1Id,
    gameData.player2Id,
  );

  if (!isValid || !playerNumber) {
    await redis.unwatch();
    return { valid: false, response: errorResponse("Invalid player secret", 403) };
  }

  if (gameData.gameStatus.currentPlayer !== playerNumber) {
    await redis.unwatch();
    return { valid: false, response: errorResponse("Not your turn", 403) };
  }

  return { valid: true, playerNumber };
}

async function executeMove(
  gameData: RedisGameData,
  column: number,
): Promise<{ success: false; response: NextResponse } | { success: true; newStatus: RedisGameData; outcome?: number }> {
  const result = makeMove(gameData.gameStatus, column);

  if (!result.success || !result.newStatus) {
    await redis.unwatch();
    return { success: false, response: errorResponse("Invalid move", 400) };
  }

  gameData.gameStatus = result.newStatus;
  return { success: true, newStatus: gameData, outcome: result.outcome };
}

async function saveOngoingGame(key: string, gameData: RedisGameData, gameId: string) {
  const multi = redis.multi();
  multi.set(key, JSON.stringify(gameData));
  const execResult = await multi.exec();

  if (!execResult) {
    return { success: false, response: errorResponse(CONCURRENT_ERROR, 409) };
  }

  await publishUpdate(gameId, "moveMade", { gameStatus: gameData.gameStatus });

  return {
    success: true,
    response: successResponse({ success: true, gameStatus: gameData.gameStatus, gameOver: false }),
  };
}

async function saveFinishedGame(
  key: string,
  gameData: RedisGameData,
  gameId: string,
  outcome: number,
) {
  const multi = redis.multi();
  multi.del(key);
  const execResult = await multi.exec();

  if (!execResult) {
    return { success: false, response: errorResponse(CONCURRENT_ERROR, 409) };
  }

  await prisma.game.create({
    data: { outcome, player1: 1, player2: 2 },
  });

  await publishUpdate(gameId, "gameOver", { gameStatus: gameData.gameStatus, outcome });

  return {
    success: true,
    response: successResponse({ success: true, gameStatus: gameData.gameStatus, gameOver: true }),
  };
}

export async function POST(request: NextRequest) {
  const params = await parseRequest(request);
  if (!params) {
    return errorResponse("Missing required fields", 400);
  }

  const { gameId, secret, column } = params;
  const key = gameKey(gameId);

  const lockAcquired = await acquireLock(key);
  if (!lockAcquired) {
    return errorResponse(CONCURRENT_ERROR, 409);
  }

  const gameData = await fetchGameWithUnwatch(key);
  if (!gameData) {
    return errorResponse("Game not found", 404);
  }

  const turnCheck = await verifyTurn(gameData, secret);
  if (!turnCheck.valid) {
    return turnCheck.response;
  }

  const moveResult = await executeMove(gameData, column);
  if (!moveResult.success) {
    return moveResult.response;
  }

  if (moveResult.outcome !== undefined) {
    const result = await saveFinishedGame(key, moveResult.newStatus, gameId, moveResult.outcome);
    return result.response;
  }

  const result = await saveOngoingGame(key, moveResult.newStatus, gameId);
  return result.response;
}
