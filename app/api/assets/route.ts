import { NextRequest, NextResponse } from "next/server";
import { assetsTable } from "@/db/schema";
import { insertItem } from "@/db/models";
import { createAssetSchema } from "@/validators/asset";
import { ValidationError } from "yup";
import { auth } from "@clerk/nextjs/server";

// POST - Create a new asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Not Authorized" },
        { status: 401 },
      );
    }

    // Validate and cast with stripUnknown
    const validatedData = await createAssetSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const result = await insertItem(assetsTable, {
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
    console.error(error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
