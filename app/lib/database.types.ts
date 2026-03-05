/**
 * Database type definitions for the Connect 4 game
 */

export interface GameRecord {
  id: number;
  winner: number; // 1 = Player 1, 2 = Player 2, 0 = Draw
  loser: number; // 1 = Player 1, 2 = Player 2, 0 = Draw
  move_count: number;
  created_at: string; // ISO 8601 timestamp
}

export interface GameSubmission {
  winner: number;
  loser: number;
  moveCount: number;
}

export interface GameStats {
  totalGames: number;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  avgMoves: number;
}

export interface GameResult {
  id: number;
  success: boolean;
}
