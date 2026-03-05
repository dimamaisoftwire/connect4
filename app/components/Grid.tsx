"use client";

import { useState } from "react";
import {
  Connect4Controller,
  GameStatus,
} from "../lib/connect4Controller";
import GameControls from "./GameControls";

type GridProps = {
  controller: Connect4Controller;
};

const PIECE_COLOURS = {
  0: "transparent",
  1: "rgb(239, 68, 68)",
  2: "rgb(234, 179, 8)",
};

export default function Grid({ controller }: GridProps) {
  const [gameStatus, setGameStatus] = useState<GameStatus>(() => controller.newGame());
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const handleColumnClick = (column: number) => {
    if (gameStatus.state !== "ongoing") return;

    const newStatus = controller.makeMove(column);
    if (newStatus) {
      setGameStatus(newStatus);
      setSaveMessage(""); // Clear previous save message
    }
  };

  const handleNewGame = () => {
    console.log("New game button clicked");
    const newStatus = controller.newGame();
    setGameStatus(newStatus);
    setSaveMessage("");
  };

  const handleSaveGame = async () => {
    if (gameStatus.state === "ongoing") return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winner: gameStatus.state === "draw" ? 0 : gameStatus.winner,
          loser:
            gameStatus.state === "draw" ? 0 : gameStatus.winner === 1 ? 2 : 1,
          moveCount: controller.getMoveCount(),
        }),
      });

      if (response.ok) {
        setSaveMessage("✓ Game saved!");
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        const error = await response.json();
        setSaveMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setSaveMessage(
        `Error: ${error instanceof Error ? error.message : "Failed to save"}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusMessage = () => {
    switch (gameStatus.state) {
      case "idle":
        return "Game not started";
      case "ongoing":
        return `Player ${gameStatus.currentPlayer}'s turn`;
      case "won":
        return `Player ${gameStatus.winner} wins!`;
      case "draw":
        return "Draw!";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-lg font-semibold">{getStatusMessage()}</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${controller.width}, minmax(0, 1fr))`,
        }}
      >
        {gameStatus.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className="aspect-square w-10 h-10 border-1 border-white dark:border-gray-700 transition-colors"
              onClick={() => handleColumnClick(colIndex)}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  backgroundColor: PIECE_COLOURS[cell],
                }}
              />
            </button>
          )),
        )}
      </div>
      <GameControls
        gameState={gameStatus.state}
        saveMessage={saveMessage}
        isSaving={isSaving}
        onNewGame={handleNewGame}
        onSaveGame={handleSaveGame}
      />
    </div>
  );
}
