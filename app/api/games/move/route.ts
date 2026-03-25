import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";
import { prisma } from "@/app/lib/prisma";
import {
  verifyPlayer,
  makeMove,
} from "@/app/lib/gameUtils";
import { RedisGameData } from "@/app/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, secret, column } = body;

    if (!gameId || !secret || column === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const gameKey = `game:${gameId}`;

    const watchResult = await redis.watch(gameKey);
    if (!watchResult) {
      return NextResponse.json(
        { error: "Concurrent modification detected, retry" },
        { status: 409 },
      );
    }

    const gameDataRaw = await redis.get(gameKey);
    if (!gameDataRaw) {
      await redis.unwatch();
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 },
      );
    }

    const gameData: RedisGameData = JSON.parse(gameDataRaw);

    const { isValid, playerNumber } = await verifyPlayer(
      secret,
      gameData.player1Id,
      gameData.player2Id,
    );

    if (!isValid || !playerNumber) {
      await redis.unwatch();
      return NextResponse.json(
        { error: "Invalid player secret" },
        { status: 403 },
      );
    }

    if (gameData.gameStatus.currentPlayer !== playerNumber) {
      await redis.unwatch();
      return NextResponse.json(
        { error: "Not your turn" },
        { status: 403 },
      );
    }

    const result = makeMove(gameData.gameStatus, column);

    if (!result.success || !result.newStatus) {
      await redis.unwatch();
      return NextResponse.json(
        { error: "Invalid move" },
        { status: 400 },
      );
    }

    gameData.gameStatus = result.newStatus;

    if (result.outcome !== undefined) {
      const multi = redis.multi();
      multi.del(gameKey);
      const execResult = await multi.exec();

      if (!execResult) {
        return NextResponse.json(
          { error: "Concurrent modification detected, retry" },
          { status: 409 },
        );
      }

      await prisma.game.create({
        data: {
          outcome: result.outcome,
          player1: 1,
          player2: 2,
        },
      });

      await redis.publish(
        `game:${gameId}:updates`,
        JSON.stringify({
          type: "gameOver",
          gameStatus: gameData.gameStatus,
          outcome: result.outcome,
        }),
      );

      return NextResponse.json(
        {
          success: true,
          gameStatus: gameData.gameStatus,
          gameOver: true,
        },
        { status: 200 },
      );
    }

    const multi = redis.multi();
    multi.set(gameKey, JSON.stringify(gameData));
    const execResult = await multi.exec();

    if (!execResult) {
      return NextResponse.json(
        { error: "Concurrent modification detected, retry" },
        { status: 409 },
      );
    }

    await redis.publish(
      `game:${gameId}:updates`,
      JSON.stringify({
        type: "moveMade",
        gameStatus: gameData.gameStatus,
      }),
    );

    return NextResponse.json(
      {
        success: true,
        gameStatus: gameData.gameStatus,
        gameOver: false,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error making move:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to make move: ${message}` },
      { status: 500 },
    );
  }
}
