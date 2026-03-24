interface StatsSummaryProps {
  player1Wins: number;
  player2Wins: number;
  draws: number;
}

export function StatsSummary({ player1Wins, player2Wins, draws }: StatsSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      <div className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {player1Wins}
        </span>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Player 1 Wins
        </span>
      </div>
      <div className="flex flex-col items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <span className="text-2xl font-bold text-red-600 dark:text-red-400">
          {player2Wins}
        </span>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Player 2 Wins
        </span>
      </div>
      <div className="flex flex-col items-center p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        <span className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">
          {draws}
        </span>
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          Draws
        </span>
      </div>
    </div>
  );
}
