import { NextRequest, NextResponse } from "next/server";
import { assetsTable } from "@/db/schema";
import { getById, deleteItemById } from "@/db/models";
import { deleteAssetSchema } from "@/validators/asset";
import { ValidationError } from "yup";
import { auth } from "@clerk/nextjs/server";

// GET - Get an asset by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Asset ID is required" },
        { status: 400 },
      );
    }

    const asset = await getById(assetsTable, id);

    if (!asset) {
      return NextResponse.json(
        { success: false, error: "Asset not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(asset, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Delete an asset (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Not Authorized" },
        { status: 401 },
      );
    }

    // Check if user has admin privileges
    const isAdmin =
      (sessionClaims?.metadata as { role?: string })?.role === "isAdmin";
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin privileges required" },
        { status: 403 },
      );
    }

    // Validate the ID
    const validatedData = await deleteAssetSchema.validate(
      { id },
      {
        abortEarly: false,
        stripUnknown: true,
      },
    );

    const result = await deleteItemById(assetsTable, validatedData.id);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Asset not found" },
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
