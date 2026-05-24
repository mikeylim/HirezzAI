import { Badge } from "@/components/ui/badge";

export function KeywordChips({ keywords }: { keywords: string[] }) {
  if (!keywords?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No missing keywords detected — you&apos;re aligned.
      </p>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((kw) => (
        <Badge key={kw} variant="outline" className="text-xs">
          {kw}
        </Badge>
      ))}
    </div>
  );
}
