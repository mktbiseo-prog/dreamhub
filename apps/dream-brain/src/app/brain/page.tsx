import { BrainViewToggle } from "@/components/BrainViewToggle";
import { BottomNav } from "@/components/BottomNav";
import { fetchGraphData } from "@/lib/queries";

export default async function BrainPage() {
  const graphData = await fetchGraphData();

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
