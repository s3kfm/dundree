import { NextRequest, NextResponse } from "next/server";
import { gamesTable } from "@/db/schema";
import { getById } from "@/db/models";
import { getGamesForUser } from "@/db/games";
import { auth } from "@clerk/nextjs/server";
import { unauthorized } from "next/navigation";
import { eq } from "drizzle-orm";

// GET - Get a game by ID (from route params)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Game ID is required" },
        { status: 400 },
      );
    }
    const { userId } = await auth();
    if (!userId) {
      return unauthorized();
    }

    const [game] = await getGamesForUser(userId, {
      where: eq(gamesTable.id, id),
    });

    if (!game) {
      return NextResponse.json(
        { success: false, error: "Game not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(game, { status: 200 });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
