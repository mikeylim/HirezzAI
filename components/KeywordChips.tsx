export function KeywordChips({ keywords }: { keywords: string[] }) {
  if (!keywords?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No missing keywords detected — you&apos;re aligned. ✅
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw) => (
        <span
          key={kw}
          className="rounded-full border border-purple-500/35 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400 transition-colors hover:bg-purple-500/20"
        >
          {kw}
        </span>
      ))}
    </div>
  );
}
