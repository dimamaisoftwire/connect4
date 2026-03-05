"use client";

import Link from "next/link";
import Grid from "./components/Grid";
import { Connect4Controller } from "./lib/connect4Controller";

export default function Home() {
  const controller = new Connect4Controller(7, 6);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center gap-12 py-32 px-16 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Connect 4
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A simple Connect 4 game
          </p>
          <Link
            href="/stats"
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            View Statistics →
          </Link>
        </div>
        <Grid controller={controller} />
      </main>
    </div>
  );
}
