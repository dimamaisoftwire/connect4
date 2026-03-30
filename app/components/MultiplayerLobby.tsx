"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCredentials } from "@/app/lib/gameCredentials";

async function createGame(): Promise<{ gameId: string; playerSecret: string; playerNumber: 1 | 2 } | null> {
  const response = await fetch("/api/games/create", { method: "POST" });
  if (!response.ok) return null;
  return response.json();
}

async function joinGame(gameId: string): Promise<{ gameId: string; playerSecret: string; playerNumber: 1 | 2 } | null> {
  const response = await fetch("/api/games/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId }),
  });
  if (!response.ok) return null;
  return response.json();
}

function navigateToGame(router: ReturnType<typeof useRouter>, gameId: string) {
  router.push(`/multiplayer/${gameId}`);
}

function CreateGameButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {disabled ? "Creating..." : "Create Multiplayer Game"}
    </button>
  );
}

function JoinGameInput({
  gameId,
  onGameIdChange,
  onJoin,
  disabled,
}: {
  gameId: string;
  onGameIdChange: (id: string) => void;
  onJoin: () => void;
  disabled: boolean;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Enter Game ID"
        value={gameId}
        onChange={(e) => onGameIdChange(e.target.value)}
        className="flex-1 px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
      />
      <button
        onClick={onJoin}
        disabled={disabled || !gameId.trim()}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {disabled ? "..." : "Join"}
      </button>
    </div>
  );
}

export function MultiplayerLobby() {
  const router = useRouter();
  const [joinGameId, setJoinGameId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const data = await createGame();
      if (!data) return;
      saveCredentials(data);
      navigateToGame(router, data.gameId);
    } catch (error) {
      console.error("Failed to create game:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!joinGameId.trim()) return;
    setIsJoining(true);
    try {
      const data = await joinGame(joinGameId.trim());
      if (!data) {
        alert("Failed to join game. Please check the game ID.");
        return;
      }
      saveCredentials(data);
      navigateToGame(router, data.gameId);
    } catch (error) {
      console.error("Failed to join game:", error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-xs">
      <CreateGameButton onClick={handleCreate} disabled={isCreating} />
      <JoinGameInput
        gameId={joinGameId}
        onGameIdChange={setJoinGameId}
        onJoin={handleJoin}
        disabled={isJoining}
      />
    </div>
  );
}
