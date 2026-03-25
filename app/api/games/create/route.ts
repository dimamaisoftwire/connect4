import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { redis } from "@/app/lib/redis";
import {
  generateSecret,
  hashSecret,
  initializeBoard
} from "@/app/lib/gameUtils";
import { RedisGameData } from "@/app/lib/types";

const GAME_TTL_SECONDS = 24 * 60 * 60; // 24 hours

export async function POST(request: NextRequest) {
  try {
    if (!process.env.REDIS_URL) {
      return NextResponse.json(
        { error: "Redis not configured" },
        { status: 500 },
      );
    }

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

    await redis.setEx(
      `game:${gameId}`,
      GAME_TTL_SECONDS,
      JSON.stringify(gameData),
    );

    return NextResponse.json(
      {
        gameId,
        playerSecret,
        playerNumber: 1,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating game:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create game: ${message}` },
      { status: 500 },
    );
  }
}
