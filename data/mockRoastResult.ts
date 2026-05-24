import type { RoastResult } from "@/types";

export const mockRoastResult: RoastResult = {
  rizzScore: 52,
  auraScore: 61,
  level: "mid",
  rizzBreakdown: {
    keywordMatch: 45,
    quantifiedBullets: 30,
    sectionStructure: 80,
    actionVerbs: 60,
    titleAlignment: 55,
  },
  missingDrip: ["TypeScript", "REST APIs", "CI/CD", "unit testing", "agile"],
  ickDetector: [
    "Zero metrics — every bullet describes a duty, not an outcome.",
    "Generic summary line ('hardworking team player') reads as filler.",
    "No mention of TypeScript or testing despite both being in the JD.",
  ],
  recruiterPOV:
    "Recruiter scans this for 7 seconds. Sees coursework, sees a club, sees an internship described in 11 words. Doesn't see a single number or a shipped product. Pile: maybe — only if pipeline is thin.",
  brainrotDiagnosis:
    "ngl your resume is mid. it's giving 'I attended the lecture' when the job wants 'I shipped the feature'. throw some numbers in there bestie, the recruiter is NOT locking in on vibes alone. fr fr you need that TypeScript rizz.",
  seriousDiagnosis:
    "Your resume reads as a list of responsibilities rather than outcomes. The job description emphasizes shipping production features and writing tests, but your bullets focus on coursework. You're close, but you need quantified impact and the specific stack keywords.",
  glowUpPlan: [
    {
      advice: "Rewrite every bullet as: action verb + what you built + measurable result.",
      priority: "high",
    },
    {
      advice: "Add TypeScript, REST APIs, and unit testing to your skills section — only if true.",
      priority: "high",
    },
    {
      advice: "Replace the 'hardworking team player' line with a concrete summary mentioning your strongest project.",
      priority: "medium",
    },
    {
      advice: "Move the LocalCo internship to the top of Experience and expand to 3 bullets.",
      priority: "medium",
    },
    {
      advice: "Drop 'Microsoft Office' from the skills section.",
      priority: "quick-win",
    },
  ],
  bulletGlowUp: [
    {
      original: "Built a website using HTML, CSS, and JavaScript for a class assignment.",
      variants: [
        "Built a responsive event-listing site in HTML/CSS/JavaScript that 80+ classmates used during finals week.",
        "Shipped a 3-page class project site, writing 600 lines of vanilla JS and using Flexbox for full mobile responsiveness.",
        "Designed and built a class project site end-to-end in 2 weeks, scoring 96/100 against grading rubric.",
      ],
    },
    {
      original: "Helped the team with various tasks and learned a lot.",
      variants: [
        "Shipped 4 bug fixes to LocalCo's checkout flow, reducing customer support tickets by 18%.",
        "Wrote internal documentation for 3 microservices, cutting new-hire onboarding time from 5 days to 2.",
        "Built a Python script that automated weekly KPI reports, saving the team ~3 hours/week.",
      ],
    },
  ],
  improvedSummary:
    "Computer Science student with hands-on experience building full-stack web apps in TypeScript and React. Shipped 3 production features used by 500+ users, with a focus on testable, maintainable code and clear collaboration with designers and backend engineers.",
  quantifiedBulletCount: { before: 0, after: 6 },
  readyToApply: false,
  memes: [
    {
      templateId: "112126428",
      templateName: "Distracted Boyfriend",
      imageUrl: "https://i.imgflip.com/1ur9b0.jpg",
      topText: "RESUME SAYS 'TEAM PLAYER'",
      bottomText: "JD SAYS 'SHIP TYPESCRIPT'",
    },
    {
      templateId: "61544",
      templateName: "This Is Fine",
      imageUrl: "https://i.imgflip.com/wxica.jpg",
      topText: "NO METRICS IN MY BULLETS",
      bottomText: "THIS IS FINE",
    },
    {
      templateId: "181913649",
      templateName: "Drake Hotline Bling",
      imageUrl: "https://i.imgflip.com/30b1gx.jpg",
      topText: "PASTE GENERIC SUMMARY",
      bottomText: "PASTE GLOW UP PLAN",
    },
  ],
  usedFallbacks: { gemini: true, brainrot: true, imgflip: true },
};
