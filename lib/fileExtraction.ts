import "server-only";
import mammoth from "mammoth";
import pdfParse from "pdf-parse/lib/pdf-parse";
import type { ExtractResponse } from "@/types";

export const MAX_RESUME_FILE_BYTES = 2 * 1024 * 1024;

const SUPPORTED_EXTENSIONS = ["txt", "docx", "pdf"] as const;
type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

function getExtension(fileName: string): SupportedExtension | null {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(extension as SupportedExtension)
    ? (extension as SupportedExtension)
    : null;
}

function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text;
}

export async function extractResumeText({
  fileName,
  mimeType,
  buffer,
}: {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<ExtractResponse> {
  const format = getExtension(fileName);
  if (!format) {
    throw new Error("Upload a .txt, .docx, or .pdf resume file.");
  }

  if (buffer.byteLength > MAX_RESUME_FILE_BYTES) {
    throw new Error("Resume file must be 2 MB or smaller.");
  }

  const allowedMimeByFormat: Record<SupportedExtension, string[]> = {
    txt: ["text/plain", "application/octet-stream"],
    docx: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ],
    pdf: ["application/pdf", "application/octet-stream"],
  };

  if (
    mimeType &&
    !allowedMimeByFormat[format].includes(mimeType) &&
    mimeType !== "application/octet-stream"
  ) {
    throw new Error(`The selected file does not look like a .${format} file.`);
  }

  let text = "";
  if (format === "txt") {
    text = buffer.toString("utf8");
  } else if (format === "docx") {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    text = await extractPdfText(buffer);
  }

  const cleaned = cleanExtractedText(text);
  if (!cleaned) {
    throw new Error("Could not find readable resume text in that file.");
  }

  return { text: cleaned, format };
}
