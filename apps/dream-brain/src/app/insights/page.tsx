export const dynamic = "force-dynamic";

import { Header } from "@/components/Header";
import { InsightsView } from "@/components/InsightsView";
import { BottomNav } from "@/components/BottomNav";
import { fetchInsight } from "@/lib/queries";

export default async function InsightsPage() {
  const weeklyInsight = await fetchInsight("weekly");

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
