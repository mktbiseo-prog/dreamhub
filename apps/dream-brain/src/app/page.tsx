import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { HomeFeed } from "@/components/HomeFeed";
import { FabButton } from "@/components/FabButton";
import { BottomNav } from "@/components/BottomNav";
import { fetchThoughts, fetchTodayInsight, fetchOnboardingStatus } from "@/lib/queries";
import { getCurrentUserId } from "@/lib/auth";

export default async function Home() {
  const userId = await getCurrentUserId();

  // Redirect non-demo users to onboarding if not completed
  if (userId !== "demo-user") {
    const onboarded = await fetchOnboardingStatus();
    if (!onboarded) {
      redirect("/onboarding");
    }
  }

  const [thoughts, todayInsight] = await Promise.all([
    fetchThoughts({ includeArchived: true }),
    fetchTodayInsight(),
  ]);

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <Header />
      <main className="flex-1 px-5 py-5">
        <HomeFeed initialThoughts={thoughts} todayInsight={todayInsight} />
      </main>
      <FabButton />
      <BottomNav />
    </div>
  );
}
