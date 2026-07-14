import { NextRequest, NextResponse } from "next/server";
import { characters } from "@/db/schema";
import { updateItemById, deleteItemById, getById } from "@/db/models";
import {
  updateCharacterSchema,
  deleteCharacterSchema,
} from "@/validators/character";
import { ValidationError } from "yup";

// GET - Get a character by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Character ID is required" },
        { status: 400 },
      );
    }

    const character = await getById(characters, id);

    if (!character) {
      return NextResponse.json(
        { success: false, error: "Character not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(character, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT - Update a character
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Character ID is required" },
        { status: 400 },
      );
    }

    // Validate and cast with stripUnknown
    const validatedData = await updateCharacterSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    console.log({ validatedData });
    const result = await updateItemById(characters, validatedData, id);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Character not found" },
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

// DELETE - Delete a character
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Validate the ID
    await deleteCharacterSchema.validate(
      { id },
      {
        abortEarly: false,
        stripUnknown: true,
      },
    );

    const result = await deleteItemById(characters, id);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Character not found" },
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
