export function ImprovedResume({
  summary,
  bullets,
}: {
  summary: string;
  bullets: string[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-2">
        <h4 className="text-sm font-semibold text-muted-foreground">
          Improved summary
        </h4>
        <p className="rounded-md border border-border bg-muted/50 p-3 text-sm leading-relaxed">
          {summary}
        </p>
      </section>

      {bullets?.length > 0 && (
        <section className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-muted-foreground">
            Suggested bullets
          </h4>
          <ul className="flex flex-col gap-2">
            {bullets.map((b, i) => (
              <li
                key={i}
                className="rounded-md border border-border bg-muted/50 p-3 text-sm leading-relaxed"
              >
                {b}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
