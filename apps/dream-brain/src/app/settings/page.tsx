export const dynamic = "force-dynamic";

import { Header } from "@/components/Header";
import { SettingsView } from "@/components/SettingsView";
import { BottomNav } from "@/components/BottomNav";
import { fetchUserPreferences } from "@/lib/queries";
import { getCurrentUserId } from "@/lib/auth";

export default async function SettingsPage() {
  const [preferences, userId] = await Promise.all([
    fetchUserPreferences(),
    getCurrentUserId(),
  ]);

  const isDemo = userId === "demo-user";

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <Header />
      <main className="flex-1 px-5 py-5">
        <SettingsView preferences={preferences} isDemo={isDemo} />
      </main>
      <BottomNav />
    </div>
  );
}
