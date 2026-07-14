"use client";

import { useQuery } from "@tanstack/react-query";
import { Scenario } from "@/types";
import ScenarioSelect from "@/app/components/scenario-select";
import GameCreationForm from "./game-creation-form";

interface GameStartClientProps {
  scenarioId?: string;
  scenario?: Scenario;
}

export default function GameStartClient({
  scenarioId,
  scenario,
}: GameStartClientProps) {
  const { data: scenariosData } = useQuery<{ data: Scenario[] }>({
    queryKey: ["scenarios"],
  });

  const scenarios = scenariosData?.data ?? [];

  // If scenarioId is provided, show the game creation form
  if (scenarioId) {
    const selectedScenario = scenarios.find((s) => s.id === scenarioId);
    return <GameCreationForm scenario={selectedScenario} />;
  }

  // Otherwise, show the scenario selection grid
  return <ScenarioSelect scenarios={scenarios} />;
}
