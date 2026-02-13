import { Header } from "@/components/Header";
import { HomeFeed } from "@/components/HomeFeed";
import { FabButton } from "@/components/FabButton";
import { BottomNav } from "@/components/BottomNav";
import { fetchThoughts } from "@/lib/queries";

export default async function Home() {
  const thoughts = await fetchThoughts();

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <Header />
      <main className="flex-1 px-5 py-5">
        <HomeFeed initialThoughts={thoughts} />
      </main>
      <FabButton />
      <BottomNav />
    </div>
  );
}
