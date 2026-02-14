import { notFound } from "next/navigation";
import { fetchThoughtById, fetchRelatedThoughts } from "@/lib/queries";
import { ThoughtDetailView } from "@/components/ThoughtDetailView";

interface ThoughtPageProps {
  params: Promise<{ id: string }>;
}

export default async function ThoughtPage({ params }: ThoughtPageProps) {
  const { id } = await params;
  const thought = await fetchThoughtById(id);

  if (!thought) notFound();

  const related = await fetchRelatedThoughts(id);

  return (
    <div className="flex min-h-screen flex-col">
      <ThoughtDetailView thought={thought} relatedThoughts={related} />
    </div>
  );
}
