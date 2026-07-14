"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Scenario } from "@/types";
import { useAsset } from "@/app/hooks/use-asset";

interface GameCreationFormProps {
  scenario?: Scenario;
}

export default function GameCreationForm({ scenario }: GameCreationFormProps) {
  const router = useRouter();
  const [gameName, setGameName] = useState(scenario?.name || "");
  const asset = useAsset(scenario?.pictureAssetId);

  const createGameMutation = useMutation({
    mutationFn: async (data: { name: string; scenarioId?: string }) => {
      const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create game");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to the newly created game
      router.push(`/games/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGameMutation.mutate({
      name: gameName,
      scenarioId: scenario?.id,
    });
  };

  if (!scenario) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center">
          <p className="text-error">Scenario not found</p>
          <button
            onClick={() => router.push("/games/start")}
            className="btn btn-primary mt-4"
          >
            Back to Scenarios
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 md:px-8 lg:py-16">
      {/* Header */}
      <header className="mb-8">
        <button
          onClick={() => router.push("/games/start")}
          className="btn btn-ghost btn-sm mb-4"
        >
          ← Back to Scenarios
        </button>
        <h1 className="section-header">Create New Game</h1>
        <p className="text-base-content/70 mt-2">
          Based on: <strong>{scenario.name}</strong>
        </p>
      </header>

      {/* Scenario Preview Card with Image */}
      <div className="campaign-card group mb-8">
        <div className="relative h-48 overflow-hidden">
          <img
            src={
              asset?.data?.secureUrl ??
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCuCCDxgGkroxBWLt1kz4u9vx2erGpfndrsbxlpGyM-cZIAyNJE8DAMIvGStjsbj2Q3TUJcwVTcEb2U8vZztDACi_AMqevhDK7vzHMAOs4iYTqLxoMO1mVekD8FwkCLJGAjAYcWpuWHIpVC7eIgY3KNZ1HJjXaciB7vD48GQDA-R50qNwBZhxf4Hp63tEM5APhIRgPXI1_Wtw1rdWhcJuETrrMp74ZAEXw89KjhT0OA61HKLEMR6XcCmtmsrfXKOpf8zY2L6MDAH51I"
            }
            alt={scenario.name || "Scenario"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-base-200 to-transparent opacity-60"></div>
        </div>
        <div className="p-6 flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="campaign-title">
              {scenario.name || "Untitled Scenario"}
            </h3>
          </div>
          <p className="campaign-description">
            {scenario.description || "No description available"}
          </p>
          {scenario.theme && (
            <div className="mt-3">
              <span className="badge badge-primary badge-sm">
                {scenario.theme}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Game Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Game Name</span>
          </label>
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            className="input input-bordered w-full"
            placeholder="Enter a name for your game"
            required
          />
          <label className="label">
            <span className="label-text-alt text-base-content/50">
              Defaults to scenario name if left unchanged
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="btn btn-primary flex-1"
            disabled={createGameMutation.isPending}
          >
            {createGameMutation.isPending ? (
              <>
                <span className="loading loading-spinner"></span>
                Creating...
              </>
            ) : (
              "Create Game"
            )}
          </button>
        </div>

        {/* Error Display */}
        {createGameMutation.isError && (
          <div className="alert alert-error">
            <span>
              {createGameMutation.error instanceof Error
                ? createGameMutation.error.message
                : "Failed to create game"}
            </span>
          </div>
        )}
      </form>
    </main>
  );
}
