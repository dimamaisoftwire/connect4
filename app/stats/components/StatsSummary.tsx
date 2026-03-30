interface StatCardProps {
  value: number;
  label: string;
  bgClass: string;
  textClass: string;
}

function StatCard({ value, label, bgClass, textClass }: StatCardProps) {
  return (
    <div className={`flex flex-col items-center p-4 rounded-lg ${bgClass}`}>
      <span className={`text-2xl font-bold ${textClass}`}>{value}</span>
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
    </div>
  );
}

interface StatsSummaryProps {
  player1Wins: number;
  player2Wins: number;
  draws: number;
}

export function StatsSummary({ player1Wins, player2Wins, draws }: StatsSummaryProps) {
  return (
    <div className="grid grid-cols-3 gap-4 w-full">
      <StatCard
        value={player1Wins}
        label="Player 1 Wins"
        bgClass="bg-blue-50 dark:bg-blue-900/20"
        textClass="text-blue-600 dark:text-blue-400"
      />
      <StatCard
        value={player2Wins}
        label="Player 2 Wins"
        bgClass="bg-red-50 dark:bg-red-900/20"
        textClass="text-red-600 dark:text-red-400"
      />
      <StatCard
        value={draws}
        label="Draws"
        bgClass="bg-zinc-100 dark:bg-zinc-800"
        textClass="text-zinc-600 dark:text-zinc-400"
      />
    </div>
  );
}
