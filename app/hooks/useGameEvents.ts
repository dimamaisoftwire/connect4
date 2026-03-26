import { useEffect } from "react";
import { GameStatus } from "@/app/lib/types";
import { GameCredentials } from "@/app/lib/gameCredentials";

interface GameEvent {
  type: string;
  gameStatus: GameStatus;
}

interface UseGameEventsOptions {
  gameId: string;
  credentials: GameCredentials | null;
  onStateUpdate: (gameStatus: GameStatus, isMyTurn: boolean) => void;
  onGameOver: (gameStatus: GameStatus) => void;
}

function isMyTurn(gameStatus: GameStatus, credentials: GameCredentials | null): boolean {
  return credentials !== null && gameStatus.currentPlayer === credentials.playerNumber;
}

export function useGameEvents({ gameId, credentials, onStateUpdate, onGameOver }: UseGameEventsOptions) {
  useEffect(() => {
    if (!gameId) return;

    const eventSource = new EventSource(`/api/games/${gameId}/events`);

    eventSource.onmessage = (event) => {
      const data: GameEvent = JSON.parse(event.data);

      if (data.type === "playerJoined" || data.type === "moveMade") {
        onStateUpdate(data.gameStatus, isMyTurn(data.gameStatus, credentials));
      }

      if (data.type === "gameOver") {
        onGameOver(data.gameStatus);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      console.error("SSE connection error");
    };

    return () => {
      eventSource.close();
    };
  }, [gameId, credentials, onStateUpdate, onGameOver]);
}
