"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { sampleInputs } from "@/data/sampleInputs";
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
  const [tone] = useState<Tone>("balanced");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim() || !resume.trim()) return;
    onSubmit({ jobTitle, jobDescription, resume, tone });
  };

  const fillExample = () => {
    setJobTitle(sampleInputs.jobTitle);
    setJobDescription(sampleInputs.jobDescription);
    setResume(sampleInputs.resume);
  };

  const disabled = isLoading || !jobTitle.trim() || !jobDescription.trim() || !resume.trim();

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
            <Label htmlFor="jobTitle">Job title</Label>
            <Input
              id="jobTitle"
              placeholder="e.g. Junior Frontend Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="jobDescription">Job description</Label>
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
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" disabled={disabled} size="lg">
              {isLoading ? "Cooking…" : "Cook my resume"}
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
