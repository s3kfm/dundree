import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ScenarioGrid from "./scenario-grid";

export default async function ScenariosPage() {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  return <ScenarioGrid />;
}
