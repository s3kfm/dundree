import crypto from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    // Validate that the user is signed in
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Not Authorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { paramsToSign: wParamsToSign } = body; // The widget sends this automatically

    const paramsToSign = {
      ...wParamsToSign,
    };
    // 1. Cloudinary requires parameters to be signed in alphabetical order
    const sortedKeys = Object.keys(paramsToSign).sort();

    const signatureString =
      sortedKeys.map((key) => `${key}=${paramsToSign[key]}`).join("&") +
      process.env.CLOUDINARY_API_SECRET;

    // 2. Hash it using SHA-1
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("hex");

    return NextResponse.json({ signature });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Signature failed" }, { status: 500 });
  }
}
