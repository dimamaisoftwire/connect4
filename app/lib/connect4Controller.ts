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
    for (let r = this.height - 1; r >= 0; r--) {
      if (this.board[r][column] === 0) {
        row = r;
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

      let r = row + dir1[0];
      let c = col + dir1[1];
      while (r >= 0 && r < this.height && c >= 0 && c < this.width && this.board[r][c] === player) {
        count++;
        r += dir1[0];
        c += dir1[1];
      }

      r = row + dir2[0];
      c = col + dir2[1];
      while (r >= 0 && r < this.height && c >= 0 && c < this.width && this.board[r][c] === player) {
        count++;
        r += dir2[0];
        c += dir2[1];
      }

      if (count >= 4) {
        return true;
      }
    }

    return false;
  }

  private checkDraw(): boolean {
    for (let r = 0; r < this.height; r++) {
      for (let c = 0; c < this.width; c++) {
        if (this.board[r][c] === 0) {
          return false;
        }
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
