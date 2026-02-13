import { Header } from "@/components/Header";
import { TimelineView } from "@/components/TimelineView";
import { FabButton } from "@/components/FabButton";
import { BottomNav } from "@/components/BottomNav";
import { fetchThoughts } from "@/lib/queries";

export default async function TimelinePage() {
  const thoughts = await fetchThoughts();

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <Header />
      <main className="flex-1 px-5 py-5">
        <TimelineView initialThoughts={thoughts} />
      </main>
      <FabButton />
      <BottomNav />
    </div>
  );
}
