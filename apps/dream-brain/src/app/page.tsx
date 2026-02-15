export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { HomeFeed } from "@/components/HomeFeed";
import { FabButton } from "@/components/FabButton";
import { BottomNav } from "@/components/BottomNav";
import { fetchThoughts, fetchTodayInsight, fetchOnboardingStatus } from "@/lib/queries";
import { getCurrentUserId } from "@/lib/auth";

export default async function Home() {
  let thoughts: Awaited<ReturnType<typeof fetchThoughts>> = [];
  let todayInsight: string | null = null;

  try {
    const userId = await getCurrentUserId();

    // Redirect non-demo users to onboarding if not completed
    if (userId !== "demo-user") {
      const onboarded = await fetchOnboardingStatus();
      if (!onboarded) {
        redirect("/onboarding");
      }
    }

    [thoughts, todayInsight] = await Promise.all([
      fetchThoughts({ includeArchived: true }),
      fetchTodayInsight(),
    ]);
  } catch (e: unknown) {
    // Re-throw redirect (Next.js uses a special error for redirects)
    if (e && typeof e === "object" && "digest" in e && typeof (e as { digest: string }).digest === "string" && (e as { digest: string }).digest.startsWith("NEXT_REDIRECT")) {
      throw e;
    }
    // DB connection error — render with empty state
    console.error("Home page data fetch failed:", e);
  }

  return (
    <div className="flex min-h-screen flex-col pb-20 md:pl-16">
      <Header />
      <main className="flex-1 pb-48">
        <HomeFeed initialThoughts={thoughts} todayInsight={todayInsight} />
      </main>
      <FabButton />
      <BottomNav />
    </div>
  );
}
