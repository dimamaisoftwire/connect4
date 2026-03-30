import { GameStatus } from "@/app/lib/types";

interface GameEvent {
  type: string;
  gameStatus: GameStatus;
}

export function registerGameSSE(
  gameId: string,
  onStateUpdate: (gameStatus: GameStatus) => void,
): () => void {
  const eventSource = new EventSource(`/api/games/${gameId}/events`);

  eventSource.onmessage = (event) => {
    const data: GameEvent = JSON.parse(event.data);

    if (data.type === "playerJoined" || data.type === "moveMade" || data.type === "gameOver") {
      onStateUpdate(data.gameStatus);
    }
  };

  eventSource.onerror = () => {
    console.error("SSE connection error");
  };

  return () => {
    eventSource.close();
  };
}
