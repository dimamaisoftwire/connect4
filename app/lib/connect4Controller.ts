import { GameStatus, Player } from "./types";
import {
  initializeBoard,
  getLowestEmptyRow,
  calculateMoveResult,
} from "./gameLogic";

export class Connect4Controller {
  public width: number;
  private height: number;
  private board: Player[][];
  private currentPlayer: Player = 1;
  private gameState: GameStatus["state"] = "idle";
  private winner: Player = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.board = initializeBoard(width, height);
  }

  public newGame(): GameStatus {
    this.board = initializeBoard(this.width, this.height);
    this.currentPlayer = 1;
    this.gameState = "ongoing";
    this.winner = 0;
    return this.getStatus();
  }

  public makeMove(column: number): GameStatus | null {
    if (this.gameState !== "ongoing") {
      return null;
    }

    const row = getLowestEmptyRow(this.board, column);
    if (row === -1) {
      return null;
    }

    const result = calculateMoveResult(
      {
        board: this.board,
        state: this.gameState,
        currentPlayer: this.currentPlayer,
      },
      row,
      column,
    );

    this.board = result.newStatus.board;
    this.gameState = result.newStatus.state;
    this.winner = result.newStatus.winner ?? 0;

    if (result.outcome !== undefined) {
      this.saveGame();
    } else {
      this.currentPlayer = result.newStatus.currentPlayer;
    }

    return this.getStatus();
  }

  private async saveGame() {
    if (this.winner === 0 && this.gameState !== "draw") return;

    const outcome: 0 | 1 | 2 = this.gameState === "draw" ? 0 : (this.winner as 1 | 2);

    try {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcome: outcome,
          player1: 1,
          player2: 2,
        }),
      });

      if (!response.ok) {
        console.error("Failed to save game:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  }

  public getStatus(): GameStatus {
    return {
      board: this.board,
      state: this.gameState,
      winner: this.winner,
      currentPlayer: this.currentPlayer,
    };
  }
}

export type { GameStatus, Player };
