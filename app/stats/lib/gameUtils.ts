export interface Game {
  id: number;
  outcome: number;
  player1: number;
  player2: number;
  createdAt: Date;
}

export function formatOutcome(outcome: number): string {
  if (outcome === 0) return "Draw";
  if (outcome === 1) return "Player 1 Wins";
  if (outcome === 2) return "Player 2 Wins";
  return "Unknown";
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getOutcomeColorClass(outcome: number): string {
  if (outcome === 1) return "text-blue-600 dark:text-blue-400";
  if (outcome === 2) return "text-red-600 dark:text-red-400";
  return "text-zinc-600 dark:text-zinc-400";
}
