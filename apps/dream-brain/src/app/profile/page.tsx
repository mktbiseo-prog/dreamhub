export const dynamic = "force-dynamic";

import { Header } from "@/components/Header";
import { ProfileView } from "@/components/ProfileView";
import { BottomNav } from "@/components/BottomNav";
import { fetchUserProfile, fetchUserStats } from "@/lib/queries";
import { getCurrentUserId } from "@/lib/auth";

export default async function ProfilePage() {
  const [profile, stats, userId] = await Promise.all([
    fetchUserProfile(),
    fetchUserStats(),
    getCurrentUserId(),
  ]);

  const isDemo = userId === "demo-user";

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
