"use client";

import { useMemo } from "react";
import { User, MapPin } from "lucide-react";
import { cn } from "@dreamhub/ui";
import type { ThoughtData } from "@/lib/data";

interface EntityFilterProps {
  thoughts: ThoughtData[];
  selectedPeople: string[];
  selectedPlaces: string[];
  onPeopleChange: (people: string[]) => void;
  onPlacesChange: (places: string[]) => void;
}

export function EntityFilter({
  thoughts,
  selectedPeople,
  selectedPlaces,
  onPeopleChange,
  onPlacesChange,
}: EntityFilterProps) {
  const { people, places } = useMemo(() => {
    const peopleSet = new Set<string>();
    const placesSet = new Set<string>();
    for (const t of thoughts) {
      for (const p of t.peopleMentioned) peopleSet.add(p);
      for (const p of t.placesMentioned) placesSet.add(p);
    }
    return {
      people: Array.from(peopleSet).sort(),
      places: Array.from(placesSet).sort(),
    };
  }, [thoughts]);

  if (people.length === 0 && places.length === 0) return null;

  function togglePerson(name: string) {
    onPeopleChange(
      selectedPeople.includes(name)
        ? selectedPeople.filter((p) => p !== name)
        : [...selectedPeople, name]
    );
  }

  function togglePlace(place: string) {
    onPlacesChange(
      selectedPlaces.includes(place)
        ? selectedPlaces.filter((p) => p !== place)
        : [...selectedPlaces, place]
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {people.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {people.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => togglePerson(name)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                selectedPeople.includes(name)
                  ? "bg-[#00D4AA]/15 text-[#00D4AA] ring-1 ring-[#00D4AA]/30"
                  : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]"
              )}
            >
              <User className="h-3 w-3" />
              @{name}
            </button>
          ))}
        </div>
      )}
      {places.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {places.map((place) => (
            <button
              key={place}
              type="button"
              onClick={() => togglePlace(place)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                selectedPlaces.includes(place)
                  ? "bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/30"
                  : "bg-white/[0.04] text-gray-400 hover:bg-white/[0.08]"
              )}
            >
              <MapPin className="h-3 w-3" />
              {place}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
