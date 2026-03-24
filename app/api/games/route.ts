import { NextRequest, NextResponse } from "next/server";
import { GameSubmission } from "@/app/lib/database.types";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body: GameSubmission = await request.json();

    if (!body.outcome || body.player1 === undefined || body.player2 === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 },
      );
    }

    const game = await prisma.game.create({
      data: {
        outcome: body.outcome,
        player1: body.player1,
        player2: body.player2,
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
