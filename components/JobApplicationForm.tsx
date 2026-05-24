"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sampleInputs } from "@/data/sampleInputs";
import { cn } from "@/lib/utils";
import type { Tone } from "@/types";

export type JobApplicationFormValues = {
  jobTitle: string;
  jobDescription: string;
  resume: string;
  tone: Tone;
};

export function JobApplicationForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (values: JobApplicationFormValues) => void;
  isLoading: boolean;
}) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [tone, setTone] = useState<Tone>("balanced");
  const [fileStatus, setFileStatus] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume.trim()) return;
    onSubmit({ jobTitle, jobDescription, resume, tone });
  };

  const fillExample = () => {
    setJobTitle(sampleInputs.jobTitle);
    setJobDescription(sampleInputs.jobDescription);
    setResume(sampleInputs.resume);
  };

  const readResumeFile = async (file: File) => {
    setIsExtracting(true);
    setFileError(null);
    setFileStatus(`Extracting text from ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error || `Upload failed (${res.status})`);
      }

      const data: { text: string; format: "txt" | "docx" | "pdf" } =
        await res.json();
      setResume(data.text);
      setFileStatus(`Loaded ${data.format.toUpperCase()} resume text.`);
    } catch (err) {
      setFileError(
        err instanceof Error ? err.message : "Could not read that resume file.",
      );
      setFileStatus(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const disabled =
    isLoading ||
    isExtracting ||
    !resume.trim();
  const toneOptions: Array<{ value: Tone; label: string; note: string }> = [
    { value: "savage", label: "Brainrot Mode", note: "Maximum roast" },
    { value: "balanced", label: "Balanced", note: "Useful and funny" },
    { value: "gentle", label: "Be Gentle", note: "Softer feedback" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paste your application</CardTitle>
        <CardDescription>
          We&apos;ll roast it, rebuild it, and tell you if you&apos;re cooked.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="jobTitle">Job title optional</Label>
            <Input
              id="jobTitle"
              placeholder="e.g. Junior Frontend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="jobDescription">Job description optional</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the full JD here…"
              className="min-h-[160px]"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="resume">Your resume / profile summary</Label>
            <Textarea
              id="resume"
              placeholder="Paste your resume text or summary…"
              className="min-h-[200px]"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              disabled={isLoading}
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Input
                id="resumeFile"
                type="file"
                accept=".txt,.docx,.pdf,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="max-w-xs"
                disabled={isLoading || isExtracting}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void readResumeFile(file);
                }}
              />
              <span>.txt, .docx, or .pdf upload fills the resume box.</span>
            </div>
            {isExtracting && (
              <p className="text-xs font-medium text-muted-foreground">
                {fileStatus ?? "Extracting resume text..."}
              </p>
            )}
            {!isExtracting && fileStatus && (
              <p className="text-xs font-medium text-emerald-700">{fileStatus}</p>
            )}
            {fileError && <p className="text-xs font-medium text-destructive">{fileError}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Roast style</Label>
            <div className="grid gap-2 md:grid-cols-3">
              {toneOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setTone(option.value)}
                  className={cn(
                    "rounded-md border border-border px-3 py-2 text-left transition-colors hover:bg-muted disabled:opacity-50",
                    tone === option.value && "border-primary bg-primary/10",
                  )}
                >
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.note}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" disabled={disabled} size="lg">
              {isLoading ? "Cooking…" : isExtracting ? "Reading file…" : "Cook my resume"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={fillExample}
              disabled={isLoading}
            >
              Try example
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
