import { DoorbellDisplay } from "@/components/cafe/display/DoorbellDisplay";
import { MOCK_CAFE } from "@/data/mockCafe";

interface PageProps {
  params: Promise<{ cafeId: string }>;
}

export default async function DoorbellDisplayPage({ params }: PageProps) {
  const { cafeId } = await params;

  // In production, fetch cafe name from DB. For now, use mock.
  const cafeName = MOCK_CAFE.name;

  return <DoorbellDisplay cafeId={cafeId} cafeName={cafeName} />;
}
