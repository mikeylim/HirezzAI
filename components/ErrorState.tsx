import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-3">
          <div>
            <p className="font-semibold text-red-400">Something went wrong</p>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
          {onRetry && (
            <Button
              onClick={onRetry}
              size="sm"
              variant="outline"
              className="w-fit gap-2 border-red-500/30 text-red-400 hover:border-red-500/50 hover:bg-red-500/10"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
