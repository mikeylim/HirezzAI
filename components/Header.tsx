import { Flame } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25">
            <Flame className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="bg-gradient-to-r from-orange-400 via-red-500 to-purple-500 bg-clip-text text-transparent">
              Cooked
            </span>
            <span className="text-foreground"> Resume</span>
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:block">
            no login · no cap · no database
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
