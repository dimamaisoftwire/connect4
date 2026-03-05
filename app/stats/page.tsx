"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GameRecord } from "../lib/database.types";

export default function StatsPage() {
  const [games, setGames] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalGames: 0,
    player1Wins: 0,
    player2Wins: 0,
    draws: 0,
    avgMoves: 0,
  });

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch("/api/games");
        if (!response.ok) {
          throw new Error("Failed to fetch games");
        }
        const data: GameRecord[] = await response.json();
        setGames(data);

        // Calculate statistics
        const totalGames = data.length;
        const player1Wins = data.filter((g) => g.winner === 1).length;
        const player2Wins = data.filter((g) => g.winner === 2).length;
        const draws = data.filter((g) => g.winner === 0).length;
        const avgMoves =
          totalGames > 0
            ? Math.round(
                data.reduce((sum, g) => sum + g.move_count, 0) / totalGames,
              )
            : 0;

        setStats({
          totalGames,
          player1Wins,
          player2Wins,
          draws,
          avgMoves,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load statistics",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Loading statistics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-lg">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Make sure you've set up the database. See DATABASE_SETUP.md
          </p>
          <Link href="/" className="text-blue-500 hover:text-blue-600">
            Back to Game
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-8">
          Game Statistics
        </h1>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">
              {stats.totalGames}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Games
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg">
            <p className="text-3xl font-bold text-red-600">
              {stats.player1Wins}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Player 1 Wins
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">
              {stats.player2Wins}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Player 2 Wins
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg">
            <p className="text-3xl font-bold text-gray-600">{stats.draws}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Draws</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">
              {stats.avgMoves}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Avg Moves
            </p>
          </div>
        </div>

        {/* Recent Games */}
        <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Recent Games
            </h2>
          </div>
          {games.length === 0 ? (
            <div className="p-6 text-center text-gray-600 dark:text-gray-400">
              No games recorded yet. Play a game and save the result!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Moves
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {games.map((game) => (
                    <tr
                      key={game.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-6 py-4">
                        {game.winner === 0 ? (
                          <span className="text-gray-600 dark:text-gray-300">
                            Draw
                          </span>
                        ) : (
                          <span
                            className="font-semibold"
                            style={{
                              color:
                                game.winner === 1
                                  ? "rgb(239, 68, 68)"
                                  : "rgb(234, 179, 8)",
                            }}
                          >
                            Player {game.winner} wins
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {game.move_count}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">
                        {formatDate(game.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back to Game Button */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Back to Game
          </Link>
        </div>
      </div>
    </div>
  );
}
