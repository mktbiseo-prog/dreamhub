export const dynamic = "force-dynamic";

import { Header } from "@/components/Header";
import { InsightsView } from "@/components/InsightsView";
import { BottomNav } from "@/components/BottomNav";
import { fetchInsight } from "@/lib/queries";

export default async function InsightsPage() {
  let weeklyInsight: import("@dreamhub/ai").InsightData;
  try {
    weeklyInsight = await fetchInsight("weekly");
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e && String((e as Record<string, unknown>).digest).startsWith("NEXT_REDIRECT")) throw e;
    weeklyInsight = {
      summary: "",
      categoryDistribution: {},
      topKeywords: [],
      emotionBreakdown: {},
      emotionTrend: "",
      patterns: [],
      actionRecommendations: [],
      todayInsight: "",
    };
  }

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <Header />
      <main className="flex-1 px-5 py-5">
        <h1 className="text-lg font-bold text-gray-100 mb-4">Insights</h1>
        <InsightsView weeklyInsight={weeklyInsight} />
      </main>
      <BottomNav />
    </div>
  );
}
