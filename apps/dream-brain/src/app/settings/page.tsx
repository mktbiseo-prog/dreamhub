export const dynamic = "force-dynamic";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { fetchUserPreferences } from "@/lib/queries";
import { getCurrentUserId } from "@/lib/auth";
import { SettingsPageClient } from "./SettingsPageClient";

export default async function SettingsPage() {
  let preferences: import("@/lib/queries").UserPreferencesData;
  let isDemo: boolean;
  let userId: string;
  try {
    const [prefs, uid] = await Promise.all([
      fetchUserPreferences(),
      getCurrentUserId(),
    ]);
    preferences = prefs;
    userId = uid;
    isDemo = uid === "demo-user";
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e && String((e as Record<string, unknown>).digest).startsWith("NEXT_REDIRECT")) throw e;
    preferences = {
      aiProcessingLevel: "standard",
      dailyPromptEnabled: true,
      weeklyInsightEnabled: true,
      connectionAlerts: true,
      defaultView: "home",
      thoughtsPerPage: 20,
      embeddingEnabled: true,
    };
    isDemo = true;
    userId = "demo-user";
  }

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <Header />
      <main className="flex-1 px-5 py-5">
        <SettingsPageClient
          preferences={preferences}
          isDemo={isDemo}
          userId={userId}
        />
      </main>
      <BottomNav />
    </div>
  );
}
