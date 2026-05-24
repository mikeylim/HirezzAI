import { NextResponse } from "next/server";
import { extractResumeText, MAX_RESUME_FILE_BYTES } from "@/lib/fileExtraction";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload body" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Resume file is required" }, { status: 400 });
  }

  if (file.size > MAX_RESUME_FILE_BYTES) {
    return NextResponse.json(
      { error: "Resume file must be 2 MB or smaller" },
      { status: 413 },
    );
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await extractResumeText({
      fileName: file.name,
      mimeType: file.type,
      buffer: Buffer.from(arrayBuffer),
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not extract text from that resume file",
      },
      { status: 400 },
    );
  }
}
