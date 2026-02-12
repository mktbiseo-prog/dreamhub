import { notFound } from "next/navigation";
import { getThoughtById, getRelatedThoughts } from "@/lib/mock-data";
import { ThoughtDetailView } from "@/components/ThoughtDetailView";
import { BottomNav } from "@/components/BottomNav";

interface ThoughtPageProps {
  params: Promise<{ id: string }>;
}

export default async function ThoughtPage({ params }: ThoughtPageProps) {
  const { id } = await params;
  const thought = getThoughtById(id);

  if (!thought) notFound();

  const related = getRelatedThoughts(id);

  return (
    <div className="flex min-h-screen flex-col pb-20">
      <ThoughtDetailView thought={thought} relatedThoughts={related} />
      <BottomNav />
    </div>
  );
}
