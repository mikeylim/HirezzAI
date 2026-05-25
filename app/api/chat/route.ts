import { NextRequest } from "next/server";
import type { RoastResult } from "@/types";

const BASE_SYSTEM_PROMPT = `You are Chef Recruiter — the AI mascot for HirezzAI, a brutally honest resume roasting app.
You're a funny, no-nonsense chef who gives sharp career advice using cooking metaphors when fitting.
Keep every reply SHORT: 2-3 sentences max. Be direct, occasionally use Gen Z slang, stay helpful.
Only answer questions about resumes, job hunting, career advice, and how HirezzAI works.
Never make up job titles, companies, or metrics the user didn't provide.
If someone asks something off-topic, redirect them back to resume/career stuff with a cooking joke.`;

function buildSystemPrompt(roastContext: RoastResult | null): string {
  if (!roastContext) return BASE_SYSTEM_PROMPT;

  const {
    rizzScore, auraScore, level, rizzBreakdown, missingDrip,
    ickDetector, recruiterPOV, seriousDiagnosis, glowUpPlan, readyToApply,
  } = roastContext;

  const topGlowUps = glowUpPlan.slice(0, 3).map(g => `- [${g.priority}] ${g.advice}`).join("\n");
  const missing = missingDrip.slice(0, 5).join(", ") || "none";
  const icks = ickDetector.slice(0, 3).join(", ") || "none";

  return `${BASE_SYSTEM_PROMPT}

The user's resume has already been analyzed. Use this data to give PERSONALIZED advice. Reference specific scores and issues when relevant.

=== USER'S ROAST RESULT ===
Rizz Score: ${rizzScore}/100 (${level})
Aura Score: ${auraScore}/100
Ready to Apply: ${readyToApply ? "Yes" : "No"}

Breakdown:
- Keyword Match: ${rizzBreakdown.keywordMatch}/100
- Quantified Bullets: ${rizzBreakdown.quantifiedBullets}/100
- Section Structure: ${rizzBreakdown.sectionStructure}/100
- Action Verbs: ${rizzBreakdown.actionVerbs}/100
- Title Alignment: ${rizzBreakdown.titleAlignment}/100

Missing Keywords: ${missing}
Red Flags (Ick Detector): ${icks}

Recruiter POV: ${recruiterPOV}

Serious Diagnosis: ${seriousDiagnosis}

Top Glow Up Items:
${topGlowUps}
=== END RESULT ===

When the user asks about their score, results, or what to fix, reference the above data directly. Keep replies short and punchy.`;
}

type Message = { role: "user" | "chef"; text: string };

export async function POST(req: NextRequest) {
  const { message, history = [], roastContext = null } = (await req.json()) as {
    message: string;
    history: Message[];
    roastContext: RoastResult | null;
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

  // Build Gemini conversation history.
  // history = [initialGreeting, ...priorExchange, currentUserMsg]
  // Skip index 0 (the chef's opening greeting) — it's covered by the primer exchange below.
  // Skip the last item (current user message) — it's added explicitly at the end.
  // This guarantees strictly alternating user/model turns that Gemini requires.
  const priorTurns = history.slice(1, -1).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  const contents = [
    // Primer exchange so the persona sticks even without a system prompt hit
    { role: "user",  parts: [{ text: "Who are you?" }] },
    { role: "model", parts: [{ text: "Chef Recruiter here 🍳 — HirezzAI's mascot. Ask me anything about resumes or job hunting and I'll keep it 💯." }] },
    // Prior conversation (already alternating after the primer)
    ...priorTurns,
    // Current user message
    { role: "user", parts: [{ text: message }] },
  ];

  try {
    const systemPrompt = buildSystemPrompt(roastContext);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { role: "system", parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.85, maxOutputTokens: 512 },
      }),
    });

    if (!res.ok) throw new Error(`Gemini ${res.status}`);

    const data = await res.json() as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        finishReason?: string;
      }>;
    };
    const candidate = data?.candidates?.[0];
    if (candidate?.finishReason && candidate.finishReason !== "STOP") {
      console.warn("[/api/chat] Gemini finishReason:", candidate.finishReason);
    }
    const reply =
      candidate?.content?.parts?.[0]?.text?.trim() ??
      "Bruh my connection got cooked. Try again?";

    return Response.json({ reply });
  } catch {
    return Response.json({
      reply: "Kitchen's on fire rn 🔥 — try again in a sec.",
    });
  }
}
