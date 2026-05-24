"use client";

import { useState } from "react";
import { Briefcase, FileText, Upload, User, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const disabled = isLoading || isExtracting || !resume.trim();
  const toneOptions: Array<{ value: Tone; label: string; note: string }> = [
    { value: "savage", label: "Brainrot Mode", note: "Maximum roast" },
    { value: "balanced", label: "Balanced", note: "Useful and funny" },
    { value: "gentle", label: "Be Gentle", note: "Softer feedback" },
  ];

  return (
    <div className="rounded-2xl border border-border/50 bg-card/60 p-6 shadow-2xl backdrop-blur-sm md:p-8">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          <span className="mr-1.5 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            ✦
          </span>
          Paste your application
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll roast it, rebuild it, and tell you if you&apos;re cooked.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="jobTitle"
            className="flex items-center gap-1.5 text-sm font-medium"
          >
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            Job title
            <span className="text-xs font-normal text-muted-foreground">
              optional
            </span>
          </Label>
          <Input
            id="jobTitle"
            placeholder="e.g. Junior Frontend Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            disabled={isLoading}
            className="border-border/50 bg-muted/30 transition-all focus-visible:border-primary/50 focus-visible:bg-muted/60 focus-visible:ring-1 focus-visible:ring-primary/30"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="jobDescription"
            className="flex items-center gap-1.5 text-sm font-medium"
          >
            <FileText className="h-3.5 w-3.5 text-primary" />
            Job description
            <span className="text-xs font-normal text-muted-foreground">
              optional
            </span>
          </Label>
          <Textarea
            id="jobDescription"
            placeholder="Paste the full JD here..."
            className="min-h-[160px] border-border/50 bg-muted/30 transition-all focus-visible:border-primary/50 focus-visible:bg-muted/60 focus-visible:ring-1 focus-visible:ring-primary/30"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="resume"
            className="flex items-center gap-1.5 text-sm font-medium"
          >
            <User className="h-3.5 w-3.5 text-primary" />
            Your resume / profile summary
          </Label>
          <Textarea
            id="resume"
            placeholder="Paste your resume text or summary..."
            className="min-h-[200px] border-border/50 bg-muted/30 transition-all focus-visible:border-primary/50 focus-visible:bg-muted/60 focus-visible:ring-1 focus-visible:ring-primary/30"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Upload className="h-3.5 w-3.5 text-primary" />
            <Input
              id="resumeFile"
              type="file"
              accept=".txt,.docx,.pdf,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="max-w-xs border-border/50 bg-muted/30"
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
            <p className="text-xs font-medium text-emerald-500">
              {fileStatus}
            </p>
          )}
          {fileError && (
            <p className="text-xs font-medium text-destructive">{fileError}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">Roast style</Label>
          <div className="grid gap-2 md:grid-cols-3">
            {toneOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                disabled={isLoading}
                onClick={() => setTone(option.value)}
                className={cn(
                  "rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted/60 disabled:opacity-50",
                  tone === option.value &&
                    "border-primary bg-primary/10 shadow-sm shadow-primary/20",
                )}
              >
                <span className="block text-sm font-semibold">
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {option.note}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            type="submit"
            disabled={disabled}
            size="lg"
            className="btn-cook group gap-2 rounded-xl px-8 font-semibold tracking-wide transition-transform duration-150"
          >
            <span
              className={
                isLoading || isExtracting
                  ? "animate-spin text-base"
                  : "text-base transition-transform duration-150 group-hover:animate-emoji-bounce"
              }
            >
              {isLoading ? "⏳" : isExtracting ? "📄" : "🔥"}
            </span>
            {isLoading
              ? "Cooking..."
              : isExtracting
                ? "Reading file..."
                : "Cook my resume"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={fillExample}
            disabled={isLoading}
            className="gap-1.5 border-border/60 hover:border-primary/40 hover:bg-muted/60"
          >
            <Wand2 className="h-3.5 w-3.5" />
            Try example
          </Button>
        </div>
      </form>
    </div>
  );
}
