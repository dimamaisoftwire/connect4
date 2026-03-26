import { GameStatus, Player } from "./types";

export function initializeBoard(width: number, height: number): Player[][] {
  return Array.from({ length: height }, () => Array(width).fill(0));
}

function countInDirection(
  board: Player[][],
  row: number,
  col: number,
  direction: [number, number],
  player: Player,
): number {
  let count = 0;
  let currentRow = row + direction[0];
  let currentCol = col + direction[1];
  while (board?.[currentRow]?.[currentCol] === player) {
    count++;
    currentRow += direction[0];
    currentCol += direction[1];
  }
  return count;
}

const WIN_DIRECTIONS: Array<[[number, number], [number, number]]> = [
  [[0, -1], [0, 1]],
  [[-1, 0], [1, 0]],
  [[-1, -1], [1, 1]],
  [[-1, 1], [1, -1]],
];

export function checkWin(
  board: Player[][],
  row: number,
  col: number,
  player: Player,
): boolean {
  for (const [dir1, dir2] of WIN_DIRECTIONS) {
    const count = 1 + countInDirection(board, row, col, dir1, player) + countInDirection(board, row, col, dir2, player);
    if (count >= 4) {
      return true;
    }
  }
  return false;
}

export function checkDraw(board: Player[][]): boolean {
  return board[0].every((cell) => cell !== 0);
}

export function getLowestEmptyRow(board: Player[][], col: number): number {
  for (let row = board.length - 1; row >= 0; row--) {
    if (board[row][col] === 0) {
      return row;
    }
  }
  return -1;
}

export function isValidMove(board: Player[][], column: number): boolean {
  return column >= 0 && column < board[0].length && board[0][column] === 0;
}

export function calculateMoveResult(
  gameStatus: GameStatus,
  row: number,
  column: number,
): { newStatus: GameStatus; outcome?: 0 | 1 | 2 } {
  const newBoard = gameStatus.board.map((r) => [...r]);
  const player = gameStatus.currentPlayer;
  newBoard[row][column] = player;

  if (checkWin(newBoard, row, column, player)) {
    return {
      newStatus: {
        board: newBoard,
        state: "won",
        winner: player,
        currentPlayer: player,
      },
      outcome: player,
    };
  }

  if (checkDraw(newBoard)) {
    return {
      newStatus: {
        board: newBoard,
        state: "draw",
        winner: 0,
        currentPlayer: player,
      },
      outcome: 0,
    };
  }

  return {
    newStatus: {
      board: newBoard,
      state: "ongoing",
      currentPlayer: player === 1 ? 2 : 1,
    },
  };
}

export function makeMove(
  gameStatus: GameStatus,
  column: number,
): { success: boolean; newStatus: GameStatus | null; outcome?: 0 | 1 | 2 } {
  if (column < 0 || column >= gameStatus.board[0].length) {
    return { success: false, newStatus: null };
  }

  const row = getLowestEmptyRow(gameStatus.board, column);
  if (row === -1) {
    return { success: false, newStatus: null };
  }

  const result = calculateMoveResult(gameStatus, row, column);
  return { success: true, ...result };
}

export type { GameStatus, Player };
