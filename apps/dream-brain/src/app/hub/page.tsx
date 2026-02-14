export const dynamic = "force-dynamic";

import { Header } from "@/components/Header";
import { HubGatewayView } from "@/components/HubGatewayView";
import { BottomNav } from "@/components/BottomNav";
import { fetchUserProfile } from "@/lib/queries";

export default async function HubPage() {
  let userName: string | null;
  let userEmail: string;
  try {
    const profile = await fetchUserProfile();
    userName = profile.name;
    userEmail = profile.email;
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e && String((e as Record<string, unknown>).digest).startsWith("NEXT_REDIRECT")) throw e;
    userName = null;
    userEmail = "";
  }

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <Header />
      <main className="flex-1 px-5 py-5">
        <HubGatewayView userName={userName} userEmail={userEmail} />
      </main>
      <BottomNav />
    </div>
  );
}
