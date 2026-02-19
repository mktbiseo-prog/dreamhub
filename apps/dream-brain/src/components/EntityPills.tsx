import { User, MapPin } from "lucide-react";

interface EntityPillsProps {
  people: string[];
  places: string[];
}

export function EntityPills({ people, places }: EntityPillsProps) {
  if (people.length === 0 && places.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
        Mentions
      </h2>
      <div className="flex flex-wrap gap-2">
        {people.map((name) => (
          <span
            key={`person-${name}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#00D4AA]/10 border border-[#00D4AA]/20 px-3 py-1.5 text-xs font-medium text-[#00D4AA]"
          >
            <User className="h-3 w-3" />
            {name}
          </span>
        ))}
        {places.map((place) => (
          <span
            key={`place-${place}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 text-xs font-medium text-teal-300"
          >
            <MapPin className="h-3 w-3" />
            {place}
          </span>
        ))}
      </div>
    </div>
  );
}
