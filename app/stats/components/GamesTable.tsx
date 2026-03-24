import { Game, formatOutcome, formatDate, getOutcomeColorClass } from "../lib/gameUtils";

interface GamesTableProps {
  games: Game[];
}

export function GamesTable({ games }: GamesTableProps) {
  if (games.length === 0) {
    return (
      <p className="text-zinc-600 dark:text-zinc-400 text-center py-8">
        No games played yet. Start playing to see stats!
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
      <table className="w-full text-left">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            <th className="px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Date
            </th>
            <th className="px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Result
            </th>
            <th className="px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-400 text-right">
              Game ID
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {games.map((game) => (
            <tr
              key={game.id}
              className="bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                {formatDate(game.createdAt)}
              </td>
              <td className="px-4 py-3 text-sm font-medium">
                <span className={getOutcomeColorClass(game.outcome)}>
                  {formatOutcome(game.outcome)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-zinc-400 dark:text-zinc-600 text-right">
                #{game.id}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
