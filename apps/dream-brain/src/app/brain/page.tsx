import { Header } from "@/components/Header";
import { BrainGraph } from "@/components/BrainGraph";
import { BottomNav } from "@/components/BottomNav";

export default function BrainPage() {
  return (
    <div className="flex min-h-screen flex-col pb-16">
      <Header />
      <main className="flex-1">
        <BrainGraph />
      </main>
      <BottomNav />
    </div>
  );
}
