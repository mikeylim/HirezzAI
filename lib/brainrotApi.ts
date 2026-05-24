import "server-only";

const BRAINROT_SWAPS: Array<[RegExp, string]> = [
  [/\bexperience\b/gi, "rizz"],
  [/\bqualified\b/gi, "locked in"],
  [/\bunqualified\b/gi, "cooked"],
  [/\bresume\b/gi, "resume (the lore)"],
  [/\bjob description\b/gi, "the assignment"],
  [/\bcandidate\b/gi, "bestie"],
  [/\bhowever\b/gi, "but lowkey"],
  [/\bunfortunately\b/gi, "respectfully, no"],
  [/\bimpressive\b/gi, "kinda fire"],
  [/\bweak\b/gi, "mid"],
  [/\bstrong\b/gi, "absolute W"],
  [/\bimprove\b/gi, "cook"],
  [/\bsuggest\b/gi, "ngl you should"],
  [/\brecommend\b/gi, "fr you gotta"],
  [/\bskills\b/gi, "skill issues fixed"],
  [/\bmissing\b/gi, "nowhere to be found"],
  [/\bgeneric\b/gi, "NPC-coded"],
  [/\bgood\b/gi, "bussin"],
  [/\bgreat\b/gi, "GOATed"],
];

function localFallback(text: string): string {
  let out = text;
  for (const [pattern, replacement] of BRAINROT_SWAPS) {
    out = out.replace(pattern, replacement);
  }
  const sprinkles = [
    "ngl",
    "fr fr",
    "no cap",
    "bestie",
    "lowkey",
  ];
  const pick = sprinkles[Math.floor(Math.random() * sprinkles.length)];
  return `${pick}, ${out}`;
}

export async function toBrainrot(
  seriousText: string,
): Promise<{ text: string; usedFallback: boolean }> {
  const url = process.env.BRAINROT_API_URL;
  const apiKey = process.env.BRAINROT_API_KEY;

  if (process.env.USE_MOCKS === "1" || !url) {
    return { text: localFallback(seriousText), usedFallback: true };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ text: seriousText }),
    });

    if (!res.ok) throw new Error(`BrainRot HTTP ${res.status}`);

    const data = await res.json();
    const translated: string | undefined =
      data?.brainrot ?? data?.text ?? data?.translation ?? data?.result;
    if (!translated) throw new Error("BrainRot returned no text field");

    return { text: translated, usedFallback: false };
  } catch (err) {
    console.error("[brainrotApi] falling back to local swap:", err);
    return { text: localFallback(seriousText), usedFallback: true };
  }
}
