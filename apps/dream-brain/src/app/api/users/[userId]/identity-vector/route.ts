import { NextResponse } from "next/server";
import type { IdentityVector } from "@dreamhub/shared-types";
import { authMiddleware } from "@dreamhub/auth/middleware";
import { i18nMiddleware } from "@dreamhub/i18n/middleware";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const i18n = i18nMiddleware(req);
  try {
    const auth = authMiddleware(req);
    if (!auth.success) {
      return NextResponse.json({ error: i18n.t(auth.status === 403 ? "error.forbidden" : "error.unauthorized"), meta: i18n.meta }, { status: auth.status });
    }
    const { userId } = await params;

    // TODO: In production, aggregate user's thought embeddings from DB
    // to compute a real identity vector (mean pooling + PCA → 1536-dim)
    //
    // For now, generate a deterministic mock vector from the userId
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0;
    }
    const seed = Math.abs(hash % 1000) / 1000;

    const identityVector: IdentityVector = {
      visionEmbedding: Array.from({ length: 16 }, (_, i) =>
        parseFloat((Math.sin(seed * (i + 1) * 3.14) * 0.5 + 0.5).toFixed(4)),
      ),
      coreValues: ["innovation", "collaboration", "growth"],
      shadowTraits: ["perfectionism"],
      emotionValence: 0.5 + seed * 0.4,
      emotionArousal: 0.3 + seed * 0.3,
    };

    return NextResponse.json({
      userId,
      identityVector,
      meta: i18n.meta,
    });
  } catch (error) {
    return NextResponse.json({ error: i18n.t("error.serverError"), meta: i18n.meta }, { status: 500 });
  }
}
