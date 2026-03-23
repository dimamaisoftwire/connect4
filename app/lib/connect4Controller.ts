export type GameState = "ongoing" | "won" | "draw" | "idle";
export type Player = 0 | 1 | 2; // 0 = empty, 1 = player 1, 2 = player 2

export interface GameStatus {
  state: GameState;
  winner?: Player;
  currentPlayer: Player;
  board: Player[][];
}

export class Connect4Controller {
  public width: number;
  private height: number;
  private board: Player[][];
  private currentPlayer: Player = 1;
  private gameState: GameState = "idle";
  private winner: Player = 0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.board = this.initializeBoard();
  }

  private initializeBoard(): Player[][] {
    return Array.from({ length: this.height }, () => Array(this.width).fill(0));
  }

  public newGame(): GameStatus {
    this.board = this.initializeBoard();
    this.currentPlayer = 1;
    this.gameState = "ongoing";
    this.winner = 0;
    return this.getStatus();
  }

  public makeMove(column: number): GameStatus | null {
    if (this.gameState !== "ongoing") {
      return null;
    }

    if (column < 0 || column >= this.width) {
      return null;
    }

    let row = -1;
    for (let currentRow = this.height - 1; currentRow >= 0; currentRow--) {
      if (this.board[currentRow][column] === 0) {
        row = currentRow;
        break;
      }
    }

    if (row === -1) {
      return null;
    }

    const player = this.currentPlayer;
    this.board[row][column] = player;

    if (this.checkWin(row, column, player)) {
      this.gameState = "won";
      this.winner = player;
      return this.getStatus();
    }

    if (this.checkDraw()) {
      this.gameState = "draw";
      return this.getStatus();
    }

    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    return this.getStatus();
  }

  private checkWin(row: number, col: number, player: Player): boolean {
    const directions = [
      [[0, -1], [0, 1]],
      [[-1, 0], [1, 0]], 
      [[-1, -1], [1, 1]], 
      [[-1, 1], [1, -1]], 
    ];

    for (const [dir1, dir2] of directions) {
      let count = 1;

      let currentRow = row + dir1[0];
      let currentColumn = col + dir1[1];
      while (this.board?.[currentRow]?.[currentColumn] === player) {
        count++;
        currentRow += dir1[0];
        currentColumn += dir1[1];
      }

      currentRow = row + dir2[0];
      currentColumn = col + dir2[1];
      while (this.board?.[currentRow]?.[currentColumn] === player) {
        count++;
        currentRow += dir2[0];
        currentColumn += dir2[1];
      }

      if (count >= 4) {
        return true;
      }
    }

    return false;
  }

  private checkDraw(): boolean {
    for (let col = 0; col < this.width; col++) {
      if (this.board[0][col] === 0) {
        return false;
      }
    }
    return true;
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
