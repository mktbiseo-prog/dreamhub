import { NextResponse } from "next/server";
import type { IdentityVector } from "@dreamhub/shared-types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
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
      emotion: {
        valence: 0.5 + seed * 0.4,
        arousal: 0.3 + seed * 0.3,
      },
    };

    return NextResponse.json({
      userId,
      identityVector,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
