import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await fetch("https://api.deepgram.com/v1/auth/grant", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ttl_seconds: 300, // Key expires in 30 seconds
        tags: ["game-session"], // Optional: for your logs
        scopes: ["usage:write"], // THIS IS MANDATORY for TTS/STT
      }),
    });

    const data = await response.json();
    //  return NextResponse.json({access_token:process.env.DEEPGRAM_API_KEY });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch token" },
      { status: 500 },
    );
  }
}
