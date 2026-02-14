import { NextResponse } from "next/server";
import { computeCrossServiceTrust, toTrustVector } from "@dreamhub/trust-engine";
import type { ServiceTrustSignal } from "@dreamhub/trust-engine";
import { getTrustSignal } from "@/lib/event-handlers";
import { getPreferenceVector } from "@/lib/offline-signals";
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

    // Accumulated doorbell trust signal from event handler
    const doorbellTrust = getTrustSignal(userId);

    // Preference vector from offline signal processing (EWMA)
    const preferenceVector = getPreferenceVector(userId);

    // Build cross-service trust signals
    // In production, these would come from each service's real data.
    // For now, we use the doorbell trust as the Place signal and mock others.
    const signals: ServiceTrustSignal[] = [
      {
        service: "place",
        score: Math.min(doorbellTrust / 10, 1), // Normalize to 0–1
        mean: 0.5,
        std: 0.2,
        reliability: 0.8,
      },
      {
        service: "brain",
        score: 0.6,
        mean: 0.55,
        std: 0.15,
        reliability: 0.7,
      },
      {
        service: "planner",
        score: 0.55,
        mean: 0.5,
        std: 0.2,
        reliability: 0.6,
      },
    ];

    const compositeTrust = computeCrossServiceTrust(signals);
    const trustVector = toTrustVector(compositeTrust, {
      doorbellResponseRate: Math.min(doorbellTrust / 5, 1),
      deliveryCompliance: 0.75,
      offlineReputation: 0.6,
    });

    return NextResponse.json({
      userId,
      doorbellTrustSignal: doorbellTrust,
      preferenceVector,
      compositeTrust,
      trustVector,
      serviceSignals: signals.map((s) => ({
        service: s.service,
        score: s.score,
        reliability: s.reliability,
      })),
      meta: i18n.meta,
    });
  } catch {
    return NextResponse.json({ error: i18n.t("error.serverError"), meta: i18n.meta }, { status: 500 });
  }
}
