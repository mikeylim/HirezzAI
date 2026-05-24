import type { RoastResult } from "@/types";

export const mockRoastResult: RoastResult = {
  cookedScore: 58,
  level: "mid",
  ratings: [
    { label: "Keyword Match", score: 55, comment: "Half the JD keywords are missing." },
    { label: "Impact", score: 60, comment: "Bullets list duties, not results." },
    { label: "Clarity", score: 70, comment: "Readable but generic." },
    { label: "Relevance", score: 50, comment: "Projects don't map to the role." },
  ],
  missingKeywords: ["TypeScript", "REST APIs", "CI/CD", "unit testing", "agile"],
  seriousDiagnosis:
    "Your resume reads as a list of responsibilities rather than outcomes. The job description emphasizes shipping production features and writing tests, but your bullets focus on coursework. You're close, but you need quantified impact and the specific stack keywords.",
  brainrotDiagnosis:
    "ngl your resume is mid. it's giving 'I attended the lecture' when the job wants 'I shipped the feature'. throw some numbers in there bestie, the recruiter is NOT locking in on vibes alone. fr fr you need that TypeScript rizz.",
  actualAdvice: [
    "Replace duty-style bullets with outcome-style: action + metric + result.",
    "Add the missing keywords naturally — don't just stuff them.",
    "Move your most relevant project to the top of the experience section.",
  ],
  improvedSummary:
    "Computer Science student with hands-on experience building full-stack web apps in TypeScript and React. Shipped 3 production features used by 500+ users, with a focus on testable, maintainable code.",
  improvedBullets: [
    "Built a TypeScript + Next.js dashboard used by 500+ beta users, cutting report-generation time from 4 minutes to under 10 seconds.",
    "Wrote unit and integration tests covering 80% of a REST API, catching 12 regressions before release.",
    "Shipped weekly via a CI/CD pipeline on Vercel, reducing manual deploy steps from 6 to 0.",
  ],
  readyToApply: false,
  memeUrl: "https://i.imgflip.com/1bij.jpg",
  memeCaption: {
    top: "RESUME SAYS 'TEAM PLAYER'",
    bottom: "JD SAYS 'SHIP TYPESCRIPT'",
  },
  usedFallbacks: { gemini: true, brainrot: true, imgflip: true },
};
