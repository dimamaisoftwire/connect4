import { NextRequest, NextResponse } from "next/server";
import { GameSubmission } from "@/app/lib/database.types";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body: GameSubmission = await request.json();

    if (
      body.winner === undefined ||
      body.loser === undefined ||
      !body.moveCount
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured. See SETUP.md" },
        { status: 500 },
      );
    }

    const game = await prisma.game.create({
      data: {
        winner: body.winner,
        loser: body.loser,
        moveCount: body.moveCount,
      },
    });

    return NextResponse.json({ id: game.id, success: true }, { status: 201 });
  } catch (error) {
    console.error("Error saving game:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to save game: ${message}` },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    const gameRecords = games.map((game) => ({
      id: game.id,
      winner: game.winner,
      loser: game.loser,
      move_count: game.moveCount,
      created_at: game.createdAt.toISOString(),
    }));

    return NextResponse.json(gameRecords);
  } catch (error) {
    console.error("Error fetching games:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch games: ${message}` },
      { status: 500 },
    );
  }
}
