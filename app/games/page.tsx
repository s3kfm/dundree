import { getGamesForUser } from "@/db/games";
import GamesComponent from "./games-component";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const games = await getGamesForUser(userId);
  return <GamesComponent games={games} />;
}
