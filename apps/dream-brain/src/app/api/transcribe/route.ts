import { NextResponse } from "next/server";
import { transcribeAudio } from "@dreamhub/ai";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const transcript = await transcribeAudio(audioFile, audioFile.name);

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("[Transcribe API] Error:", error);
    const message = error instanceof Error ? error.message : "Transcription failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
