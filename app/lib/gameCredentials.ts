export interface GameCredentials {
  gameId: string;
  playerSecret: string;
  playerNumber: 1 | 2;
}

function storageKey(gameId: string): string {
  return `game:${gameId}`;
}

export function saveCredentials(credentials: GameCredentials): void {
  localStorage.setItem(storageKey(credentials.gameId), JSON.stringify(credentials));
}

export function loadCredentials(gameId: string): GameCredentials | null {
  const stored = localStorage.getItem(storageKey(gameId));
  return stored ? JSON.parse(stored) : null;
}
