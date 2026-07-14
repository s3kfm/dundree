"use client";

import { GameWithDetails } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { Plus, Filter } from "lucide-react";
import GameCard from "./game-card";
import Link from "next/link";

export default function GamesComponent({
  games: initialGames,
}: {
  games: GameWithDetails[];
}) {
  const { data } = useQuery({
    queryKey: ["games"],
    initialData: { data: initialGames },
  });
  const { data: games } = data ?? {};
  return (
    <main className="max-w-7xl mx-auto px-6 py-6 md:px-8 lg:py-16 pb-32">
      {/* Header Section */}
      <header className="mb-5 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="section-header text-center md:text-left">
            My Campaigns
          </h1>
        </div>
        <div className="flex gap-4 hidden">
          <button className="btn btn-ghost border border-base-content/10 font-label text-xs uppercase tracking-wider">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>
      </header>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* Start New Campaign Action Card */}

        {/* Render Game Cards */}
        {games?.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
        <Link href="/games/start" className="start-card">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Plus className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-headline font-bold text-base-content mb-2">
            Start New Campaign
          </h3>
          <p className="text-center text-base-content/50 text-sm px-4">
            Begin a new voice-driven odyssey through the void.
          </p>
          <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </Link>
      </div>
    </main>
  );
}
