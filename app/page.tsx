"use client";

import Link from "next/link";
import Grid from "./components/Grid";
import { Connect4Controller } from "./lib/connect4Controller";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const controller = new Connect4Controller(7, 6);
  const router = useRouter();
  const [joinGameId, setJoinGameId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateGame = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/games/create", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(
          `game:${data.gameId}`,
          JSON.stringify({
            gameId: data.gameId,
            playerSecret: data.playerSecret,
            playerNumber: data.playerNumber,
          }),
        );
        router.push(`/multiplayer/${data.gameId}`);
      }
    } catch (error) {
      console.error("Failed to create game:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async () => {
    if (!joinGameId.trim()) return;
    setIsJoining(true);
    try {
      const response = await fetch("/api/games/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: joinGameId.trim() }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(
          `game:${data.gameId}`,
          JSON.stringify({
            gameId: data.gameId,
            playerSecret: data.playerSecret,
            playerNumber: data.playerNumber,
          }),
        );
        router.push(`/multiplayer/${data.gameId}`);
      } else {
        alert("Failed to join game. Please check the game ID.");
      }
    } catch (error) {
      console.error("Failed to join game:", error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-12 py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Connect 4
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A simple Connect 4 game
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={handleCreateGame}
              disabled={isCreating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Multiplayer Game"}
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Game ID"
                value={joinGameId}
                onChange={(e) => setJoinGameId(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
              />
              <button
                onClick={handleJoinGame}
                disabled={isJoining || !joinGameId.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isJoining ? "..." : "Join"}
              </button>
            </div>
          </div>
          <Link
            href="/stats"
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            View Statistics →
          </Link>
        </div>
        <Grid controller={controller} />
      </main>
    </div>
  );
}
