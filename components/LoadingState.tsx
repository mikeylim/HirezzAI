import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  "Asking Gemini to read your resume…",
  "Counting missing keywords…",
  "Translating the diagnosis to brainrot…",
  "Generating a meme that captures your pain…",
];

export function LoadingState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-base font-medium">Cooking your resume…</p>
        <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
          {STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
