import { NextRequest, NextResponse } from "next/server";
import { scenariosTable } from "@/db/schema";
import { insertItem } from "@/db/models";
import { createScenarioSchema } from "@/validators/scenario";
import { ValidationError } from "yup";
import { auth } from "@clerk/nextjs/server";
import { getScenarios } from "@/db/scenarios";

// GET - Get all scenarios (public scenarios + user's own scenarios if authenticated)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    // Get limit and offset from query params
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    // If userId exists, get public scenarios + user's scenarios
    // If no userId, only get public scenarios
    const scenarios = await getScenarios(userId ?? undefined, {
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return NextResponse.json(
      { success: true, data: scenarios },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching scenarios:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST - Create a new scenario (automatically assigns current user's ID)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userId } = await auth();
    if (!userId) {
      return Response.json({ message: "Not Authorized" }, { status: 401 });
    }

    // Validate and cast with stripUnknown
    const validatedData = await createScenarioSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    // Automatically assign the current user's ID to the scenario
    const result = await insertItem(scenariosTable, {
      ...validatedData,
      userId,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400 },
      );
    }
    console.error("Error creating scenario:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
