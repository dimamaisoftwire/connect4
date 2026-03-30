export type GameState = "idle" | "ongoing" | "won" | "draw";

export type Player = 0 | 1 | 2;

export interface GameStatus {
  board: Player[][];
  state: GameState;
  winner?: Player;
  currentPlayer: Player;
}

export interface RedisGameData {
  gameStatus: GameStatus;
  player1Id: string;
  player2Id: string | null;
}
