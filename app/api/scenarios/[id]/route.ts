import { NextRequest, NextResponse } from "next/server";
import { scenariosTable } from "@/db/schema";
import { getById, updateItemById, deleteItemById } from "@/db/models";
import {
  updateScenarioSchema,
  deleteScenarioSchema,
} from "@/validators/scenario";
import { ValidationError } from "yup";
import { auth } from "@clerk/nextjs/server";

// GET - Get a scenario by ID
// Validates that userId matches the scenario OR scenario userId is null (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Scenario ID is required" },
        { status: 400 },
      );
    }

    const scenario = await getById(scenariosTable, id);

    if (!scenario) {
      return NextResponse.json(
        { success: false, error: "Scenario not found" },
        { status: 404 },
      );
    }

    // Allow access if scenario is public (userId is null) OR user owns it
    if (scenario.userId !== null && scenario.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Not authorized to access this scenario" },
        { status: 403 },
      );
    }

    return NextResponse.json(scenario, { status: 200 });
  } catch (error) {
    console.error("Error fetching scenario:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update a scenario
// Validates that userId matches the scenario
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return Response.json({ message: "Not Authorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Scenario ID is required" },
        { status: 400 },
      );
    }

    // Check if scenario exists and user owns it
    const scenario = await getById(scenariosTable, id);
    if (!scenario) {
      return NextResponse.json(
        { success: false, error: "Scenario not found" },
        { status: 404 },
      );
    }

    if (scenario.userId !== userId && !sessionClaims.isAdmin) {
      return NextResponse.json(
        { success: false, error: "Not authorized to update this scenario" },
        { status: 403 },
      );
    }

    // Validate and cast with stripUnknown
    const validatedData = await updateScenarioSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const result = await updateItemById(scenariosTable, validatedData, id);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Scenario not found" },
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

    console.error("Error updating scenario:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a scenario
// Validates that userId matches the scenario
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return Response.json({ message: "Not Authorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Scenario ID is required" },
        { status: 400 },
      );
    }

    // Check if scenario exists and user owns it
    const scenario = await getById(scenariosTable, id);
    if (!scenario) {
      return NextResponse.json(
        { success: false, error: "Scenario not found" },
        { status: 404 },
      );
    }

    if (scenario.userId !== userId) {
      return NextResponse.json(
        { success: false, error: "Not authorized to delete this scenario" },
        { status: 403 },
      );
    }

    const result = await deleteItemById(scenariosTable, id);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Scenario not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, data: result[0] },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting scenario:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
