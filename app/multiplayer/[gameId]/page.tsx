"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { GameStatus } from "@/app/lib/types";
import { GameBoard } from "@/app/components/Grid";

interface GameCredentials {
  gameId: string;
  playerSecret: string;
  playerNumber: 1 | 2;
}

export default function MultiplayerGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;

  const [credentials, setCredentials] = useState<GameCredentials | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`game:${gameId}`);
    if (stored) {
      setCredentials(JSON.parse(stored));
    } else {
      setError("No game credentials found. Please join or create a game.");
    }
  }, [gameId]);

  useEffect(() => {
    if (!credentials) return;

    const fetchGameState = async () => {
      try {
        const response = await fetch(`/api/games/${gameId}/state`);
        if (response.ok) {
          const data = await response.json();
          setGameStatus(data.gameStatus);
          setIsMyTurn(data.gameStatus.currentPlayer === credentials.playerNumber);
          setGameOver(data.gameStatus.state === "won" || data.gameStatus.state === "draw");
        }
      } catch (err) {
        console.error("Failed to fetch game state:", err);
      }
    };

    fetchGameState();
  }, [credentials, gameId]);

  useEffect(() => {
    if (!gameId) return;

    const eventSource = new EventSource(`/api/games/${gameId}/events`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "playerJoined" || data.type === "moveMade") {
        setGameStatus(data.gameStatus);
        if (credentials) {
          setIsMyTurn(data.gameStatus.currentPlayer === credentials.playerNumber);
        }
      }

      if (data.type === "gameOver") {
        setGameStatus(data.gameStatus);
        setGameOver(true);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      console.error("SSE connection error");
    };

    return () => {
      eventSource.close();
    };
  }, [gameId, credentials]);

  const handleColumnClick = useCallback(
    async (column: number) => {
      if (!credentials || !isMyTurn || gameOver) return;

      try {
        const response = await fetch("/api/games/move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameId,
            secret: credentials.playerSecret,
            column,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Move failed:", error);
          return;
        }

        const result = await response.json();
        setGameStatus(result.gameStatus);
        setIsMyTurn(result.gameStatus.currentPlayer === credentials.playerNumber);
        if (result.gameOver) {
          setGameOver(true);
        }
      } catch (err) {
        console.error("Failed to make move:", err);
      }
    },
    [credentials, gameId, isMyTurn, gameOver],
  );

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <a href="/" className="text-blue-600 hover:underline mt-4 block">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (!credentials || !gameStatus) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-6 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Game #{gameId}</h1>
          <p className="text-sm text-zinc-600 mb-2">
            You are Player {credentials.playerNumber}
          </p>
        </div>

        <GameBoard
          gameStatus={gameStatus}
          onColumnClick={handleColumnClick}
          disabled={!isMyTurn || gameOver || gameStatus.state === "idle"}
          showReset={true}
          onReset={() => window.location.href = "/"}
          width={7}
        />

        <a
          href="/"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          ← Back to Home
        </a>
      </main>
    </div>
  );
}
