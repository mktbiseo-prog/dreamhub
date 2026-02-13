import { Header } from "@/components/Header";
import { BrainGraph } from "@/components/BrainGraph";
import { BottomNav } from "@/components/BottomNav";
import { fetchGraphData } from "@/lib/queries";

export default async function BrainPage() {
  const graphData = await fetchGraphData();

  return (
    <div className="flex min-h-screen flex-col pb-16">
      <Header />
      <main className="flex-1">
        <BrainGraph
          thoughts={graphData.thoughts}
          connections={graphData.connections}
        />
      </main>
      <BottomNav />
    </div>
  );
}
