import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are Chef Recruiter — the AI mascot for HirezzAI, a brutally honest resume roasting app.
You're a funny, no-nonsense chef who gives sharp career advice using cooking metaphors when fitting.
Keep every reply SHORT: 2-3 sentences max. Be direct, occasionally use Gen Z slang, stay helpful.
Only answer questions about resumes, job hunting, career advice, and how HirezzAI works.
Never make up job titles, companies, or metrics the user didn't provide.
If someone asks something off-topic, redirect them back to resume/career stuff with a cooking joke.`;

type Message = { role: "user" | "chef"; text: string };

export async function POST(req: NextRequest) {
  const { message, history = [] } = (await req.json()) as {
    message: string;
    history: Message[];
  };

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

  // Fallback if no API key
  if (!apiKey) {
    const fallbacks = [
      "No API key in the kitchen rn 😅 — but real talk: tailor your resume to each JD, hit the keywords, and quantify everything.",
      "Chef's offline but the recipe is: strong summary, quantified bullets, and zero spelling errors. That's the W.",
      "Can't reach the cloud rn — but your resume should be 1 page if you're under 5 years exp. No cap.",
    ];
    return Response.json({ reply: fallbacks[Math.floor(Math.random() * fallbacks.length)] });
  }

  // Build Gemini conversation history (exclude the last message — that's what we're sending)
  const contents = [
    // Inject system as first user/model exchange so it sticks
    { role: "user", parts: [{ text: "Who are you?" }] },
    { role: "model", parts: [{ text: "Chef Recruiter here 🍳 — HirezzAI's mascot. Ask me anything about resumes or job hunting and I'll keep it 💯." }] },
    // Prior conversation
    ...history.slice(0, -1).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    })),
    // Current user message
    { role: "user", parts: [{ text: message }] },
  ];

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.85, maxOutputTokens: 120 },
      }),
    });

    if (!res.ok) throw new Error(`Gemini ${res.status}`);

    const data = await res.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      "Bruh my connection got cooked. Try again?";

    return Response.json({ reply });
  } catch {
    return Response.json({
      reply: "Kitchen's on fire rn 🔥 — try again in a sec.",
    });
  }
}
