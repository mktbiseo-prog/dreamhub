import { Header } from "@/components/Header";
import { HubGatewayView } from "@/components/HubGatewayView";
import { BottomNav } from "@/components/BottomNav";
import { fetchUserProfile } from "@/lib/queries";

export default async function HubPage() {
  const profile = await fetchUserProfile();

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <Header />
      <main className="flex-1 px-5 py-5">
        <HubGatewayView userName={profile.name} userEmail={profile.email} />
      </main>
      <BottomNav />
    </div>
  );
}
