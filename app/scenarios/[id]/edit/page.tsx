import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ScenarioForm from "@/app/components/scenario-form";
import { getById } from "@/db/models";
import { scenariosTable } from "@/db/schema";
import { notFound } from "next/navigation";
import { Location } from "@/types";

export default async function EditScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const { id } = await params;

  // Fetch the scenario
  const scenario = await getById(scenariosTable, id);

  if (!scenario) {
    return notFound();
  }

  // Check if user owns the scenario
  if (scenario.userId !== userId && !sessionClaims.isAdmin) {
    return redirect("/scenarios");
  }

  // Transform scenario data to match ScenarioFormValues
  const initialValues = {
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    pictureAssetId: scenario.pictureAssetId,
    theme: scenario.theme || undefined,
    axioms: scenario.axioms || [],
    locations: (scenario.locations as Location[]) || [],
  };

  return (
    <div className="container max-w-10xl mx-auto px-4 py-8">
      <div className="mb-8"></div>
      <ScenarioForm initialValues={initialValues} />
    </div>
  );
}
