export const dynamic = "force-dynamic";

import { Header } from "@/components/Header";
import { TimelineView } from "@/components/TimelineView";
import { FabButton } from "@/components/FabButton";
import { BottomNav } from "@/components/BottomNav";
import { fetchThoughts } from "@/lib/queries";

export default async function TimelinePage() {
  let thoughts: import("@/lib/data").ThoughtData[];
  try {
    thoughts = await fetchThoughts({ includeArchived: true });
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e && String((e as Record<string, unknown>).digest).startsWith("NEXT_REDIRECT")) throw e;
    thoughts = [];
  }

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
