export function ImprovedResume({
  summary,
  bullets,
}: {
  summary: string;
  bullets: string[];
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Summary */}
      <section className="flex flex-col gap-2.5">
        <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="inline-block h-1.5 w-5 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
          Improved summary
        </h4>
        <p className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 text-sm leading-relaxed">
          {summary}
        </p>
      </section>

      {/* Bullets */}
      {bullets?.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="inline-block h-1.5 w-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
            Suggested bullets
          </h4>
          <ul className="flex flex-col gap-2">
            {bullets.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-border/40 bg-muted/30 p-3.5 text-sm leading-relaxed"
              >
                <span className="mt-0.5 shrink-0 font-mono text-xs font-bold text-purple-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {b}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
