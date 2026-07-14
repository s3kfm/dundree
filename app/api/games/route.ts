import { NextRequest, NextResponse } from "next/server";
import { gamesTable, scenariosTable } from "@/db/schema";
import {
  insertItem,
  updateItemById,
  deleteItemById,
  getById,
} from "@/db/models";
import {
  createGameSchema,
  updateGameSchema,
  deleteGameSchema,
} from "@/validators/game";
import { ValidationError } from "yup";
import { auth } from "@clerk/nextjs/server";
import { getGamesForUser } from "@/db/games";
import { unauthorized } from "next/navigation";

// POST - Create a new game
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userId } = await auth();
    if (!userId) {
      return Response.json({ message: "Not Authorized" }, { status: 401 });
    }
    // Validate and cast with removeUnknown
    const validatedData = await createGameSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // If scenarioId is provided, load scenario data
    let setting = validatedData.setting || "";
    let axioms: string[] =
      validatedData.axioms?.filter((a): a is string => typeof a === "string") ||
      [];

    if (validatedData.scenarioId) {
      const scenario = await getById(scenariosTable, validatedData.scenarioId);

      if (scenario) {
        // Load description into setting and axioms from scenario
        setting = scenario.description;
        axioms = (scenario.axioms || []).filter(
          (a): a is string => typeof a === "string",
        );
      }
    }

    const gameData = {
      ...validatedData,
      userId,
      setting,
      axioms,
    };

    const result = await insertItem(gamesTable, gameData);

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

// GET - Get a game by ID (from query params)
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return unauthorized();
    }
    const games = await getGamesForUser(userId);

    return NextResponse.json({ success: true, data: games }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update a game
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ message: "Not Authorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Game ID is required" },
        { status: 400 },
      );
    }
    const game = await getById(gamesTable, id);
    if (!game || game.userId !== userId)
      return NextResponse.json({
        success: false,
        error: "Game doesn't existi",
      });
    // Validate and cast with removeUnknown
    const validatedData = await updateGameSchema.cast(updateData, {
      stripUnknown: true,
    });

    const result = await updateItemById(gamesTable, validatedData, id);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Game not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: result[0] },
      { status: 200 },
    );
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

// DELETE - Delete a game
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate and cast with removeUnknown
    const validatedData = await deleteGameSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const result = await deleteItemById(gamesTable, validatedData.id);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Game not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: result[0] },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
