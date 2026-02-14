export const dynamic = "force-dynamic";

import { BrainViewToggle } from "@/components/BrainViewToggle";
import { BottomNav } from "@/components/BottomNav";
import { fetchGraphData } from "@/lib/queries";

export default async function BrainPage() {
  let graphData: { thoughts: import("@/lib/data").ThoughtData[]; connections: import("@/lib/data").ConnectionData[] };
  try {
    graphData = await fetchGraphData();
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e && String((e as Record<string, unknown>).digest).startsWith("NEXT_REDIRECT")) throw e;
    graphData = { thoughts: [], connections: [] };
  }

  return (
    <div className="flex h-screen flex-col">
      <main className="flex-1 relative">
        <BrainViewToggle
          thoughts={graphData.thoughts}
          connections={graphData.connections}
        />
      </main>
      <BottomNav />
    </div>
  );
}
