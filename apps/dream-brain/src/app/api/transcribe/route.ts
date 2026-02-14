import { NextResponse } from "next/server";
import { transcribeAudio } from "@dreamhub/ai";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

export async function POST(request: Request) {
  const i18n = i18nMiddleware(request);
  try {
    const auth = authMiddleware(request);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: i18n.t("error.validation"), meta: i18n.meta },
        { status: 400 }
      );
    }

    const transcript = await transcribeAudio(audioFile, audioFile.name);

    return NextResponse.json({ transcript, meta: i18n.meta });
  } catch (error) {
    console.error("[Transcribe API] Error:", error);
    return NextResponse.json({ error: i18n.t("error.serverError"), meta: i18n.meta }, { status: 500 });
  }
}
