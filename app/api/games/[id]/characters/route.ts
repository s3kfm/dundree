import { NextRequest, NextResponse } from "next/server";
import { characters } from "@/db/schema";
import { insertItem } from "@/db/models";
import { characterFormSchema } from "@/validators/character";
import { ValidationError } from "yup";
import { db } from "@/db";
import { eq } from "drizzle-orm";

// POST - Create a new character
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: gameId } = await params;
    const body = await request.json();

    // Validate and cast with stripUnknown
    const validatedData = await characterFormSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const result = await insertItem(characters, { ...validatedData, gameId });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 },
      );
    }
    console.error(error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET - Get characters by game ID (from query params)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: gameId } = await params;

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: "Game ID is required" },
        { status: 400 },
      );
    }

    const charactersList = await db
      .select()
      .from(characters)
      .where(eq(characters.gameId, gameId));

    return NextResponse.json(charactersList, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
