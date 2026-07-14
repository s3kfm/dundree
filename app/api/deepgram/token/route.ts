import { NextResponse } from "next/server";
import { DeepgramClient } from "@deepgram/sdk";

export async function GET() {
  const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY });

  // Generate a temp key for the project. Expires in 60s.
  const result = await deepgram.auth.v1.tokens.grant({
    ttl_seconds: 1000,
  });

  return NextResponse.json(result);
}
