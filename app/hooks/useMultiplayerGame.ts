import { useEffect, useState, useCallback } from "react";
import { GameStatus } from "@/app/lib/types";
import { GameCredentials, loadCredentials } from "@/app/lib/gameCredentials";
import { registerGameSSE } from "./useGameEvents";

async function fetchInitialState(gameId: string): Promise<GameStatus | null> {
  try {
    const response = await fetch(`/api/games/${gameId}/state`);
    if (response.ok) {
      const data = await response.json();
      return data.gameStatus;
    }
  } catch (err) {
    console.error("Failed to fetch game state:", err);
  }
  return null;
}

async function submitMove(gameId: string, secret: string, column: number) {
  const response = await fetch("/api/games/move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId, secret, column }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Move failed:", error);
    return null;
  }

  return response.json();
}


export function useMultiplayerGame(gameId: string) {
  const [credentials, setCredentials] = useState<GameCredentials | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isMyTurn = credentials !== null && gameStatus !== null
    && gameStatus.currentPlayer === credentials.playerNumber;
  const gameOver = gameStatus !== null
    && (gameStatus.state === "won" || gameStatus.state === "draw");

  useEffect(() => {
    const stored = loadCredentials(gameId);
    if (stored) {
      setCredentials(stored);
    } else {
      setError("No game credentials found. Please join or create a game.");
    }
  }, [gameId]);

  useEffect(() => {
    if (!gameId || !credentials) return;

    fetchInitialState(gameId).then((status) => {
      if (status) setGameStatus(status);
    });

    return registerGameSSE(gameId, setGameStatus);
  }, [gameId, credentials]);

  const handleColumnClick = useCallback(
    async (column: number) => {
      if (!credentials || !isMyTurn || gameOver) return;

      const result = await submitMove(gameId, credentials.playerSecret, column);
      if (!result) return;

      setGameStatus(result.gameStatus);
    },
    [credentials, gameId, isMyTurn, gameOver],
  );

  return { credentials, gameStatus, error, isMyTurn, gameOver, handleColumnClick };
}
