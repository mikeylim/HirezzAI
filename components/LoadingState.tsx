const STEPS = [
  { emoji: "🧠", text: "Asking Gemini to read your resume…" },
  { emoji: "🔍", text: "Counting missing keywords…" },
  { emoji: "💀", text: "Translating the diagnosis to brainrot…" },
  { emoji: "🎭", text: "Generating a meme that captures your pain…" },
];

export function LoadingState() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-8 shadow-2xl backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Layered spinner */}
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 animate-spin rounded-full border-[2.5px] border-transparent border-t-orange-500 border-r-red-500" />
          <div className="absolute inset-2 animate-spin-reverse rounded-full border-[2px] border-transparent border-b-purple-500 border-l-pink-400" />
          <div className="absolute inset-0 flex items-center justify-center text-xl">🔥</div>
        </div>

        <div>
          <p className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-base font-semibold text-transparent">
            Cooking your resume…
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            This takes about 10–15 seconds
          </p>
        </div>

        <ul className="flex w-full max-w-sm flex-col gap-2 text-left">
          {STEPS.map((s) => (
            <li
              key={s.text}
              className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground"
            >
              <span className="text-sm">{s.emoji}</span>
              {s.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
