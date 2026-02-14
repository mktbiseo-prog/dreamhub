export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { fetchThoughtById, fetchRelatedThoughts } from "@/lib/queries";
import { ThoughtDetailView } from "@/components/ThoughtDetailView";

interface ThoughtPageProps {
  params: Promise<{ id: string }>;
}

export default async function ThoughtPage({ params }: ThoughtPageProps) {
  const { id } = await params;

  let thought: import("@/lib/data").ThoughtData;
  let related: import("@/lib/data").RelatedThoughtData[];
  try {
    const fetched = await fetchThoughtById(id);
    if (!fetched) notFound();
    thought = fetched;
    related = await fetchRelatedThoughts(id);
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) {
      const digest = String((e as Record<string, unknown>).digest);
      if (digest.startsWith("NEXT_REDIRECT") || digest.startsWith("NEXT_NOT_FOUND")) throw e;
    }
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <ThoughtDetailView thought={thought} relatedThoughts={related} />
    </div>
  );
}
