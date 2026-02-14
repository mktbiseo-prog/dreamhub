export const dynamic = "force-dynamic";

import { Header } from "@/components/Header";
import { ProfileView } from "@/components/ProfileView";
import { BottomNav } from "@/components/BottomNav";
import { fetchUserProfile, fetchUserStats } from "@/lib/queries";
import { getCurrentUserId } from "@/lib/auth";

export default async function ProfilePage() {
  let profile: import("@/lib/queries").UserProfile;
  let stats: import("@/lib/queries").UserStats;
  let isDemo: boolean;
  try {
    const [p, s, userId] = await Promise.all([
      fetchUserProfile(),
      fetchUserStats(),
      getCurrentUserId(),
    ]);
    profile = p;
    stats = s;
    isDemo = userId === "demo-user";
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e && String((e as Record<string, unknown>).digest).startsWith("NEXT_REDIRECT")) throw e;
    profile = { name: null, email: "", bio: null, dreamStatement: null, skills: [], interests: [] };
    stats = { totalThoughts: 0, topCategory: null };
    isDemo = true;
  }

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <Header />
      <main className="flex-1 px-5 py-5">
        <ProfileView profile={profile} stats={stats} isDemo={isDemo} />
      </main>
      <BottomNav />
    </div>
  );
}
