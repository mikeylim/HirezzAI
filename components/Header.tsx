import { Flame } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Flame className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">Cooked Resume</span>
        </div>
        <span className="text-xs text-muted-foreground">
          how cooked is your application?
        </span>
      </div>
    </header>
  );
}
