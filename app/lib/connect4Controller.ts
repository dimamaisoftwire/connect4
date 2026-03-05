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
  private board: Player[][]; // (width x height)
  private currentPlayer: Player = 1;
  private gameState: GameState = "idle";
  private moveCount: number = 0;
  private readonly WIN_LENGTH = 4;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.board = this.initializeBoard();
  }

  private initializeBoard(): Player[][] {
    return Array.from({ length: this.height }, () => Array(this.width).fill(0));
  }

  /**
   * Start a new game
   */
  public newGame(): GameStatus {
    console.log("Starting new game");
    this.board = this.initializeBoard();
    this.currentPlayer = 1;
    this.gameState = "ongoing";
    this.moveCount = 0;
    return this.getStatus();
  }

  /**
   * Make a move by dropping a piece in a column
   * @param column - The column index (0-based)
   * @returns Updated game status, or null if move is invalid
   */
  public makeMove(column: number): GameStatus | null {
    console.log("Validate column");
    if (column < 0 || column >= this.width) {
      return null;
    }

    console.log("Check if column is full");
    if (this.board[0][column] !== 0) {
      return null;
    }

    console.log("Find the lowest empty row in this column");
    let row = this.height - 1;
    for (let i = this.height - 1; i >= 0; i--) {
      if (this.board[i][column] === 0) {
        row = i;
        break;
      }
    }

    console.log("Place the piece");
    this.board[row][column] = this.currentPlayer;
    this.moveCount++;

    console.log("Check for win");
    if (this.checkWin(row, column, this.currentPlayer)) {
      this.gameState = "won";
      return this.getStatus();
    }

    console.log("Check for draw");
    if (this.moveCount === this.width * this.height) {
      this.gameState = "draw";
      return this.getStatus();
    }

    console.log("Switch player", this.currentPlayer);
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    console.log("Current player is now", this.currentPlayer);

    return this.getStatus();
  }

  /**
   * Check if the last move resulted in a win
   */
  private checkWin(row: number, col: number, player: Player): boolean {
    if (this.checkDirection(row, col, player, 0, 1)) return true;
    if (this.checkDirection(row, col, player, 1, 0)) return true;
    if (this.checkDirection(row, col, player, 1, 1)) return true;
    if (this.checkDirection(row, col, player, 1, -1)) return true;

    return false;
  }

  /**
   * Check if there are 4 in a row in a specific direction
   */
  private checkDirection(
    row: number,
    col: number,
    player: Player,
    rowDelta: number,
    colDelta: number,
  ): boolean {
    let count = 1;

    // Count in positive direction
    let r = row + rowDelta;
    let c = col + colDelta;
    while (r >= 0 && r < this.height && c >= 0 && c < this.width) {
      if (this.board[r][c] === player) {
        count++;
        r += rowDelta;
        c += colDelta;
      } else {
        break;
      }
    }

    // Count in negative direction
    r = row - rowDelta;
    c = col - colDelta;
    while (r >= 0 && r < this.height && c >= 0 && c < this.width) {
      if (this.board[r][c] === player) {
        count++;
        r -= rowDelta;
        c -= colDelta;
      } else {
        break;
      }
    }

    return count >= this.WIN_LENGTH;
  }

  /**
   * Get the current game status
   */
  public getStatus(): GameStatus {
    return {
      board: this.board,
      state: this.gameState,
      winner: this.gameState === "won" ? this.currentPlayer : undefined,
      currentPlayer: this.currentPlayer,
    };
  }

  /**
   * Check if a column is valid for placing a piece
   */
  public isValidColumn(column: number): boolean {
    if (column < 0 || column >= this.width) return false;
    return this.board[0][column] === 0;
  }

  /**
   * Get all valid columns
   */
  public getValidColumns(): number[] {
    const validColumns: number[] = [];
    for (let col = 0; col < this.width; col++) {
      if (this.isValidColumn(col)) {
        validColumns.push(col);
      }
    }
    return validColumns;
  }

  /**
   * Get the current move count
   */
  public getMoveCount(): number {
    return this.moveCount;
  }
}
