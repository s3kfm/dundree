"use client";

import { useState } from "react";
import { Scenario } from "@/types";
import { useRouter } from "next/navigation";
import { useAsset } from "../hooks/use-asset";

interface ScenarioSelectProps {
  scenarios: Scenario[];
}

export default function ScenarioSelect({ scenarios }: ScenarioSelectProps) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const router = useRouter();

  // Extract unique themes from scenarios
  const themes = Array.from(
    new Set(scenarios.map((s) => s.theme).filter(Boolean)),
  ) as string[];

  // Filter scenarios by selected theme
  const filteredScenarios = selectedTheme
    ? scenarios.filter((s) => s.theme === selectedTheme)
    : scenarios;

  const handleScenarioSelect = (scenarioId: string) => {
    router.push(`/games/start?scenarioId=${scenarioId}`);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 md:px-8 lg:py-16 pb-32">
      {/* Header Section */}
      <header className="mb-12">
        <div>
          <h1 className="section-header">Select a Scenario</h1>
          <p className="text-base-content/70 mt-2">
            Choose a scenario to start your adventure
          </p>
        </div>
      </header>

      {/* Theme Filter Buttons */}
      {themes.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedTheme(null)}
            className={`btn btn-sm ${
              selectedTheme === null ? "btn-primary" : "btn-outline"
            }`}
          >
            All Themes
          </button>
          {themes.map((theme) => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              className={`btn btn-sm ${
                selectedTheme === theme ? "btn-primary" : "btn-outline"
              }`}
            >
              {theme}
            </button>
          ))}
        </div>
      )}

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredScenarios.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            onSelect={handleScenarioSelect}
          />
        ))}

        {filteredScenarios.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-base-content/50">
              No scenarios found for this theme.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

interface ScenarioCardProps {
  scenario: Scenario;
  onSelect: (scenarioId: string) => void;
}

function ScenarioCard({ scenario, onSelect }: ScenarioCardProps) {
  const asset = useAsset(scenario.pictureAssetId);

  return (
    <div className="campaign-card group">
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
      <button onClick={() => onSelect(scenario.id)} className="campaign-button">
        Select Scenario
      </button>
    </div>
  );
}
