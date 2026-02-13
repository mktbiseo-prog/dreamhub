import { notFound } from "next/navigation";
import { fetchThoughtById, fetchRelatedThoughts } from "@/lib/queries";
import { ThoughtDetailView } from "@/components/ThoughtDetailView";
import { BottomNav } from "@/components/BottomNav";

interface ThoughtPageProps {
  params: Promise<{ id: string }>;
}

export default async function ThoughtPage({ params }: ThoughtPageProps) {
  const { id } = await params;
  const thought = await fetchThoughtById(id);

  if (!thought) notFound();

  const related = await fetchRelatedThoughts(id);

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <ThoughtDetailView thought={thought} relatedThoughts={related} />
      <BottomNav />
    </div>
  );
}
