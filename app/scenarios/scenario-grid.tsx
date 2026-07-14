"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import ScenarioCard from "./scenario-card";
import { Scenario } from "@/types";
import Link from "next/link";

export default function ScenarioGrid() {
  const { data, isLoading, error } = useQuery<{ data: Scenario[] }>({
    queryKey: ["scenarios"],
  });

  const scenarios = data?.data ?? [];

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 md:px-8 lg:py-16 pb-32">
      {/* Header Section */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="section-header">Scenarios</h1>
        </div>
      </header>

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-error">
            Failed to load scenarios. Please try again.
          </p>
        </div>
      )}

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* Create New Scenario Action Card */}
        <Link href="/scenarios/create" className="button start-card">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Plus className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-headline font-bold text-base-content mb-2">
            Create New Scenario
          </h3>
          <p className="text-center text-base-content/50 text-sm px-4">
            Design your own custom scenario with unique rules and settings.
          </p>
          <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </Link>

        {/* Render Scenario Cards */}
        {!isLoading &&
          scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}

        {/* Loading State */}
        {isLoading && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="campaign-card animate-pulse">
                <div className="h-48 bg-base-300"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-base-300 rounded"></div>
                  <div className="h-4 bg-base-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </main>
  );
}
