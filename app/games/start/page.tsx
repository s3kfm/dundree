import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import GameStartClient from "./game-start-client";

export default async function GameStartPage({
  searchParams,
}: {
  searchParams: Promise<{ scenarioId?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const params = await searchParams;
  const scenarioId = params.scenarioId;

  return <GameStartClient scenarioId={scenarioId} />;
}
