import { DeepgramClient } from "@deepgram/sdk";
import { NextRequest } from "next/server";

export async function POST(req: Request) {
  const { text } = await req.json();
  const deepgram = new DeepgramClient({
    apiKey: process.env.DEEPGRAM_API_KEY!,
  });

  try {
    const response = await deepgram.speak.v1.audio.generate({
      text,
      model: "aura-2-thalia-en",
      encoding: "mp3",
      container: "mp3",
    });

    const stream = await response.stream();
    if (!stream) throw new Error("No audio stream returned");

    return new Response(stream, {
      headers: { "Content-Type": "audio/wav" },
    });
  } catch (error) {
    console.error("Deepgram Error:", error);
    return new Response("Audio synthesis failed", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text")!;
  const voice = req.nextUrl.searchParams.get("voice")!;
  const deepgram = new DeepgramClient({
    apiKey: process.env.DEEPGRAM_API_KEY!,
  });

  console.log({
    model: voice || "aura-2-thalia-en", // "Asteria" is a great, clear narrator
    encoding: "mp3",
  });
  try {
    const response = await deepgram.speak.v1.audio.generate({
      text,
      model: voice || "aura-2-thalia-en", // "Asteria" is a great, clear narrator
      encoding: "mp3",
    });

    const stream = await response.stream();
    if (!stream) throw new Error("No audio stream returned");

    return new Response(stream, {
      headers: { "Content-Type": "audio/wav" },
    });
  } catch (error) {
    console.error("Deepgram Error:", error);
    return new Response("Audio synthesis failed", { status: 500 });
  }
}
