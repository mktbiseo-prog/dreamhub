import { Header } from "@/components/Header";
import { SemanticSearchView } from "@/components/SemanticSearchView";
import { BottomNav } from "@/components/BottomNav";

export default function SearchPage() {
  return (
    <div className="flex min-h-screen flex-col pb-20">
      <Header />
      <main className="flex-1 px-5 py-5">
        <SemanticSearchView />
      </main>
      <BottomNav />
    </div>
  );
}
