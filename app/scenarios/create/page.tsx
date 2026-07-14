import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ScenarioForm from "@/app/components/scenario-form";

export default async function CreateScenarioPage() {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  return (
    <div className="container max-w-10xl mx-auto px-4 py-8">
      <div className="mb-8"></div>
      <ScenarioForm />
    </div>
  );
}
