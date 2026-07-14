import { db } from "@/db";
import GameComponent from "./game-component";
import { getById } from "@/db/models";
import { gameMessagesTable, gamesTable } from "@/db/schema";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getGamesForUser } from "@/db/games";
import { auth } from "@clerk/nextjs/server";

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    return notFound();
  }
  const [game] = await getGamesForUser(userId, {
    where: eq(gamesTable.id, id),
  });
  const messages = await db
    .select()
    .from(gameMessagesTable)
    .where(eq(gameMessagesTable.gameId, id));

  if (!game) {
    notFound();
  }

  return <GameComponent game={game} messages={messages} />;
}
