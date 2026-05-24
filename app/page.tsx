"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { JobApplicationForm, type JobApplicationFormValues } from "@/components/JobApplicationForm";
import { RoastResultCard } from "@/components/RoastResultCard";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import type { RoastResult } from "@/types";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [lastInput, setLastInput] = useState<JobApplicationFormValues | null>(null);

  const runRoast = async (values: JobApplicationFormValues) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setLastInput(values);
    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || `Request failed (${res.status})`);
      }
      const data: RoastResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="flex flex-col gap-8">
          <section>
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
              How cooked is your application?
            </h1>
            <p className="text-muted-foreground">
              Paste a job and your resume. We&apos;ll score the fit, roast the gaps, and
              hand you a rebuilt summary you can actually use.
            </p>
          </section>

          <JobApplicationForm onSubmit={runRoast} isLoading={isLoading} />

          {isLoading && <LoadingState />}
          {error && !isLoading && (
            <ErrorState
              message={error}
              onRetry={lastInput ? () => runRoast(lastInput) : undefined}
            />
          )}
          {result && !isLoading && !error && <RoastResultCard result={result} />}
        </div>
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Built for the hackathon. No login, no database, no cap.
      </footer>
    </div>
  );
}
