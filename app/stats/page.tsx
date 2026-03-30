import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { Game } from "./types";
import { GamesTable } from "./components/GamesTable";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-12 py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Game Stats
          </h1>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Game
          </Link>
        </div>

        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
            Game History ({games.length} games)
          </h2>
          <GamesTable games={games} />
        </div>
      </main>
    </div>
  );
}
