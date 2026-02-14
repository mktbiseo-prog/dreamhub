import { SemanticSearchView } from "@/components/SemanticSearchView";
import { BottomNav } from "@/components/BottomNav";

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col pb-20">
      <main className="flex-1 px-4 pt-4">
        <SemanticSearchView />
      </main>
      <BottomNav />
    </div>
  );
}
