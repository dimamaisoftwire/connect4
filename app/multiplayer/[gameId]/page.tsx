"use client";

import { useParams } from "next/navigation";
import { GameBoard } from "@/app/components/Grid";
import { useMultiplayerGame } from "@/app/hooks/useMultiplayerGame";

function ErrorView({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="text-center">
        <p className="text-red-600">{message}</p>
        <a href="/" className="text-blue-600 hover:underline mt-4 block">
          Back to Home
        </a>
      </div>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <p>Loading...</p>
    </div>
  );
}

function GameHeader({ gameId, playerNumber }: { gameId: string; playerNumber: number }) {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">Game #{gameId}</h1>
      <p className="text-sm text-zinc-600 mb-2">
        You are Player {playerNumber}
      </p>
    </div>
  );
}

export default function MultiplayerGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const { credentials, gameStatus, error, isMyTurn, gameOver, handleColumnClick } =
    useMultiplayerGame(gameId);

  if (error) return <ErrorView message={error} />;
  if (!credentials || !gameStatus) return <LoadingView />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-col items-center gap-6 p-8">
        <GameHeader gameId={gameId} playerNumber={credentials.playerNumber} />

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
