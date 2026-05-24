"use client";

import { useState } from "react";
import { Briefcase, FileText, User, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sampleInputs } from "@/data/sampleInputs";

export type JobApplicationFormValues = {
  jobTitle: string;
  jobDescription: string;
  resume: string;
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

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim() || !resume.trim()) return;
    onSubmit({ jobTitle, jobDescription, resume });
  };

  const fillExample = () => {
    setJobTitle(sampleInputs.jobTitle);
    setJobDescription(sampleInputs.jobDescription);
    setResume(sampleInputs.resume);
  };

  const disabled =
    isLoading || !jobTitle.trim() || !jobDescription.trim() || !resume.trim();

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
        {/* Job title */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="jobTitle"
            className="flex items-center gap-1.5 text-sm font-medium"
          >
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            Job title
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

        {/* Job description */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="jobDescription"
            className="flex items-center gap-1.5 text-sm font-medium"
          >
            <FileText className="h-3.5 w-3.5 text-primary" />
            Job description
          </Label>
          <Textarea
            id="jobDescription"
            placeholder="Paste the full JD here…"
            className="min-h-[160px] border-border/50 bg-muted/30 transition-all focus-visible:border-primary/50 focus-visible:bg-muted/60 focus-visible:ring-1 focus-visible:ring-primary/30"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Resume */}
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
            placeholder="Paste your resume text or summary…"
            className="min-h-[200px] border-border/50 bg-muted/30 transition-all focus-visible:border-primary/50 focus-visible:bg-muted/60 focus-visible:ring-1 focus-visible:ring-primary/30"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            disabled={isLoading}
          />
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
                isLoading
                  ? "animate-spin text-base"
                  : "text-base transition-transform duration-150 group-hover:animate-emoji-bounce"
              }
            >
              {isLoading ? "⏳" : "🔥"}
            </span>
            {isLoading ? "Cooking…" : "Cook my resume"}
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
