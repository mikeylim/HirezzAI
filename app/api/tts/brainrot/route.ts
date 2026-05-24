import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_TTS_CHARS = 1400;

function validateText(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const text = (body as Record<string, unknown>).text;
  if (typeof text !== "string" || !text.trim()) return null;
  return text.trim().slice(0, MAX_TTS_CHARS);
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = validateText(payload);
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const modelId = process.env.ELEVENLABS_MODEL_ID || "eleven_v3";

  if (!apiKey || !voiceId) {
    return NextResponse.json(
      { error: "ElevenLabs API key or voice ID is not configured" },
      { status: 503 },
    );
  }

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: `Brainrot diagnosis incoming. Chat, lock in. ${text}`,
        model_id: modelId,
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    console.error("[tts/brainrot] ElevenLabs error", res.status, errText.slice(0, 300));
    return NextResponse.json(
      { error: "Could not generate ElevenLabs audio" },
      { status: 502 },
    );
  }

  const audio = await res.arrayBuffer();
  return new Response(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
