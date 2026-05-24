import "server-only";

const BRAINROT_SWAPS: Array<[RegExp, string]> = [
  [/\bexperience\b/gi, "lore-backed rizz"],
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
  [/\bawkward\b/gi, "weaponized cringe"],
  [/\bunclear\b/gi, "sus and giving side quest confusion"],
  [/\bimprovement\b/gi, "glow up arc"],
  [/\bexcellent\b/gi, "understood the assignment"],
  [/\btruth\b/gi, "no cap"],
  [/\bprofessional\b/gi, "corporate-core"],
  [/\brecruiter\b/gi, "recruiter final boss"],
  [/\bmetrics?\b/gi, "receipts"],
  [/\bspecific\b/gi, "receipts-loaded"],
  [/\bresponsibilities\b/gi, "job chore lore"],
  [/\bachievements?\b/gi, "W moments"],
  [/\brelevant\b/gi, "actually on-theme"],
  [/\bprojects?\b/gi, "side quests"],
];

const OPENERS = [
  "ngl bestie, this resume just walked into the ATS with negative aura",
  "chat, the resume is trying to pass the vibe check and the vibe check is buffering",
  "respectfully, the recruiter final boss is not getting stunned by this loadout",
  "no cap, this application is in its training arc but the XP bar is low",
  "IYKYK, the lore is there but the receipts are hiding in witness protection",
  "fr fr, this is giving LinkedIn side quest with zero main-character proof",
];

const REACTIONS = [
  "The ATS is looking for receipts and this is handing over a vibes-only mood board.",
  "This is lowkey delulu-maxxing: big ambition, tiny evidence trail.",
  "The bullets are yapping, but they are not beating the allegations.",
  "The recruiter is speedrunning the skim and almost missed the plot.",
  "Right now the resume is soft-launching skills instead of hard-launching impact.",
  "It has aura potential, but the proof economy is in a recession.",
  "The keyword drip is not dripping; it is politely evaporating.",
  "This needs less 'I helped' energy and more 'I shipped the thing' energy.",
];

const CLOSERS = [
  "Add numbers, name the stack, show the outcome, and suddenly the aura recovers.",
  "Turn the vague lore into quantified canon events and the resume starts to slap.",
  "Swap NPC-coded bullets for action + tech + result, and we may be so back.",
  "Give every bullet receipts, or the ATS will keep acting brand new.",
  "Make the proof impossible to ignore and the recruiter might actually lock in.",
  "Less yap, more shipped-feature evidence. That is the whole glow up arc.",
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function addBrainrotOverdrive(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return `${pick(OPENERS)}. ${cleaned} ${pick(REACTIONS)} ${pick(CLOSERS)}`;
}

function localFallback(text: string): string {
  let out = text;
  for (const [pattern, replacement] of BRAINROT_SWAPS) {
    out = out.replace(pattern, replacement);
  }
  return addBrainrotOverdrive(out);
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
      body: JSON.stringify({
        text: seriousText,
        style:
          "MAXIMUM funny Gen Z/brainrot resume roast. Use no cap, fr fr, rizz, aura, cooked, mid, delulu, sus, cringe, IYKYK, understood the assignment, glow up arc, NPC-coded, yapping, receipts, final boss, canon event, side quest, main character, soft launch, slaps. Make it chaotic but still useful.",
      }),
    });

    if (!res.ok) throw new Error(`BrainRot HTTP ${res.status}`);

    const data = await res.json();
    const translated: string | undefined =
      data?.brainrot ?? data?.text ?? data?.translation ?? data?.result;
    if (!translated) throw new Error("BrainRot returned no text field");

    return { text: addBrainrotOverdrive(translated), usedFallback: false };
  } catch (err) {
    console.error("[brainrotApi] falling back to local swap:", err);
    return { text: localFallback(seriousText), usedFallback: true };
  }
}
