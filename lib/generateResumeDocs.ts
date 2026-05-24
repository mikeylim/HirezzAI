/**
 * generateResumeDocs.ts
 *
 * Client-side only. Builds a polished "glow-up" resume by:
 *   1. Replacing every weak bullet with its best Gemini variant
 *   2. Replacing (or prepending) the summary section
 *
 * Exports:
 *   buildGlowedUpResume  — returns the final plain-text string
 *   downloadDocx         — generates a .docx file and triggers a browser download
 *   openPdfPreviewTab    — opens a print-ready HTML preview in a new tab
 */

import type { RoastResult } from "@/types";

/* ── Text assembly helpers ─────────────────────────────── */

/**
 * Swap every original bullet with the first (best) Gemini variant.
 * Uses simple string replacement — first occurrence only.
 */
function applyBulletSwaps(
  text: string,
  bulletGlowUp: RoastResult["bulletGlowUp"],
): string {
  let out = text;
  for (const item of bulletGlowUp) {
    const best = item.variants[0];
    if (best && item.original && out.includes(item.original)) {
      out = out.replace(item.original, best);
    }
  }
  return out;
}

/**
 * Replace the existing summary section with the improved one,
 * or prepend it if no recognisable summary header is found.
 */
function applySummarySwap(text: string, improvedSummary: string): string {
  // Matches common summary section headings at the start of a line
  const HEADER_RE =
    /^(professional\s+)?(summary|profile|about(\s+me)?|objective|overview|career\s+(summary|objective))\s*\r?\n/im;

  const m = text.match(HEADER_RE);
  if (m && m.index !== undefined) {
    const afterHeader = m.index + m[0].length;
    const rest = text.slice(afterHeader);

    // Find where the next section starts
    const NEXT_RE = /\n\n(?=\S)|\n(?=[A-Z][A-Z\s&/\-]{3,}\r?\n)/;
    const nextM = rest.match(NEXT_RE);
    if (nextM && nextM.index !== undefined) {
      return (
        text.slice(0, afterHeader) +
        improvedSummary +
        "\n\n" +
        rest.slice(nextM.index).trimStart()
      );
    }
    return text.slice(0, afterHeader) + improvedSummary;
  }

  // No summary header detected — prepend it
  return `PROFESSIONAL SUMMARY\n${improvedSummary}\n\n${text}`;
}

/**
 * Returns the full glow-up text: original resume with bullets
 * swapped and summary replaced. If no original is provided, builds
 * a minimal document from the Gemini improvements alone.
 */
export function buildGlowedUpResume(
  originalResume: string,
  result: RoastResult,
): string {
  if (!originalResume.trim()) {
    // No original — build a minimal "improvements only" document
    const bullets = result.bulletGlowUp
      .map((item) => `• ${item.variants[0] ?? item.original}`)
      .join("\n");
    return [
      "PROFESSIONAL SUMMARY",
      result.improvedSummary,
      "",
      ...(bullets ? ["IMPROVED EXPERIENCE BULLETS", bullets] : []),
    ].join("\n");
  }

  const withBullets = applyBulletSwaps(originalResume, result.bulletGlowUp);
  return applySummarySwap(withBullets, result.improvedSummary);
}

/* ── Shared line classifier ────────────────────────────── */

const KNOWN_HEADER_RE =
  /^(professional\s+)?(summary|profile|about(\s+me)?|objective|overview|career|experience|education|skills|projects|certifications|awards|languages|interests|references|work\s+history|employment|achievements)/i;

function classifyLine(line: string): "header" | "bullet" | "empty" | "text" {
  const t = line.trim();
  if (!t) return "empty";

  const isKnownHeader =
    KNOWN_HEADER_RE.test(t) && t.length < 60;
  const isAllCapsHeader =
    /^[A-Z][A-Z\s&/|:\-]{3,}$/.test(t) && t.length < 60;

  if (isKnownHeader || isAllCapsHeader) return "header";

  if (
    t.startsWith("•") ||
    t.startsWith("-") ||
    t.startsWith("*") ||
    /^\d+\.\s/.test(t)
  )
    return "bullet";

  return "text";
}

/* ── DOCX generation ───────────────────────────────────── */

/**
 * Builds a properly formatted Word document and triggers a browser download.
 * Uses dynamic import so docx is only loaded when the user clicks the button.
 */
export async function downloadDocx(
  originalResume: string,
  result: RoastResult,
  jobTitle?: string,
): Promise<void> {
  // Dynamic import — keeps docx out of the initial bundle
  const { Document, Packer, Paragraph, TextRun, BorderStyle } = await import(
    "docx"
  );

  const finalText = buildGlowedUpResume(originalResume, result);
  const children: InstanceType<typeof Paragraph>[] = [];

  for (const raw of finalText.split("\n")) {
    const line = raw.trimEnd();
    const kind = classifyLine(line);

    if (kind === "empty") {
      children.push(new Paragraph({ children: [] }));
      continue;
    }

    if (kind === "header") {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line.trim().toUpperCase(),
              bold: true,
              size: 24, // 12 pt
              font: "Calibri",
              color: "111111",
            }),
          ],
          spacing: { before: 280, after: 80 },
          border: {
            bottom: {
              color: "444444",
              size: 6,
              space: 1,
              style: BorderStyle.SINGLE,
            },
          },
        }),
      );
      continue;
    }

    if (kind === "bullet") {
      const bulletText = line.trim().replace(/^[•\-*]\s*/, "").replace(/^\d+\.\s*/, "");
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: bulletText, size: 22, font: "Calibri" }),
          ],
          bullet: { level: 0 },
          spacing: { after: 48 },
        }),
      );
      continue;
    }

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: line.trim(), size: 22, font: "Calibri" }),
        ],
        spacing: { after: 60 },
      }),
    );
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 1080, bottom: 720, left: 1080 },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = jobTitle
    ? jobTitle.replace(/[^a-z0-9]/gi, "-").toLowerCase()
    : "resume";
  a.download = `improved-${safeName}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── PDF preview tab ───────────────────────────────────── */

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Opens a print-ready HTML preview in a new browser tab.
 * The tab includes a "Save as PDF" button that calls window.print().
 */
export function openPdfPreviewTab(
  originalResume: string,
  result: RoastResult,
  jobTitle?: string,
): void {
  const finalText = buildGlowedUpResume(originalResume, result);

  const bodyRows = finalText
    .split("\n")
    .map((raw) => {
      const line = raw.trimEnd();
      const kind = classifyLine(line);
      if (kind === "empty") return `<div class="spacer"></div>`;
      if (kind === "header") return `<h2>${esc(line.trim().toUpperCase())}</h2>`;
      if (kind === "bullet") return `<p class="bullet">${esc(line.trim())}</p>`;
      return `<p>${esc(line.trim())}</p>`;
    })
    .join("\n");

  const pageTitle = jobTitle
    ? `${jobTitle} — Improved Resume · HirezzAI`
    : "Improved Resume · HirezzAI";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(pageTitle)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{font-family:Georgia,'Times New Roman',serif;font-size:11pt;line-height:1.58;color:#111;background:#e5e5e5}

  /* ── Toolbar ── */
  .toolbar{
    background:#111;color:#fff;
    display:flex;align-items:center;justify-content:space-between;gap:12px;
    padding:13px 24px;position:sticky;top:0;z-index:100
  }
  .toolbar-left{display:flex;align-items:center;gap:10px}
  .logo{font-size:20px;line-height:1}
  .toolbar-title{font-family:sans-serif;font-size:14px;font-weight:700}
  .toolbar-sub{font-family:sans-serif;font-size:11px;opacity:0.55;margin-left:2px}
  .btn-dl{
    background:#FF6B35;color:#fff;border:none;border-radius:7px;
    padding:9px 22px;font-size:13px;font-weight:700;cursor:pointer;
    font-family:sans-serif;letter-spacing:0.03em;display:flex;align-items:center;gap:6px;
    transition:background 0.15s
  }
  .btn-dl:hover{background:#e55a25}

  /* ── Resume page ── */
  .page{
    background:#fff;max-width:8.5in;
    margin:32px auto 64px;
    padding:0.9in 1in;
    min-height:11in;
    box-shadow:0 8px 48px rgba(0,0,0,0.14)
  }
  .ai-badge{
    display:inline-flex;align-items:center;gap:6px;
    background:#FF6B35;color:#fff;
    border-radius:5px;padding:3px 11px;
    font-size:8pt;font-family:sans-serif;font-weight:700;letter-spacing:0.04em;
    margin-bottom:1.3em
  }
  h2{
    font-family:sans-serif;font-size:10pt;font-weight:700;
    letter-spacing:0.08em;text-transform:uppercase;
    margin-top:1.4em;margin-bottom:0.35em;
    border-bottom:1.5px solid #333;padding-bottom:3px;color:#111
  }
  p{font-size:11pt;margin-bottom:0.22em;color:#222}
  p.bullet{padding-left:1.4em;text-indent:-0.5em}
  .spacer{height:0.45em}

  /* ── Print ── */
  @media print{
    .toolbar{display:none!important}
    body{background:#fff}
    .page{box-shadow:none;margin:0;padding:0.75in 0.85in;min-height:auto}
    @page{size:letter;margin:0}
  }
</style>
</head>
<body>
<div class="toolbar">
  <div class="toolbar-left">
    <span class="logo">🍳</span>
    <span class="toolbar-title">HirezzAI — Improved Resume</span>
    ${jobTitle ? `<span class="toolbar-sub">· ${esc(jobTitle)}</span>` : ""}
  </div>
  <button class="btn-dl" onclick="window.print()">
    ⬇&nbsp; Save as PDF
  </button>
</div>
<div class="page">
  <div class="ai-badge">✨ AI-Improved by HirezzAI</div>
${bodyRows}
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  // Don't revoke — the new tab needs it alive
}
