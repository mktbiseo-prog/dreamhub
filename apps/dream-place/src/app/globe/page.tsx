"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useDreamStore } from "@/store/useDreamStore";
import { CITY_COORDS } from "@/components/globe/DreamGlobe";

// Dynamic import to avoid SSR issues with Three.js
const DreamGlobe = dynamic(
  () =>
    import("@/components/globe/DreamGlobe").then((mod) => mod.DreamGlobe),
  { ssr: false }
);

export default function GlobePage() {
  const discoverFeed = useDreamStore((s) => s.discoverFeed);
  const matches = useDreamStore((s) => s.matches);
  const currentUser = useDreamStore((s) => s.currentUser);

  // Build globe points from profiles
  const cityCount: Record<string, { count: number; city: string }> = {};
  const allProfiles = [
    currentUser,
    ...discoverFeed.map((m) => m.profile),
    ...matches.map((m) => m.profile),
  ];

  for (const p of allProfiles) {
    const key = p.city?.toLowerCase() ?? "";
    if (!cityCount[key]) {
      cityCount[key] = { count: 0, city: p.city };
    }
    cityCount[key].count++;
  }

  const points = Object.entries(cityCount)
    .map(([, { count, city }]) => {
      const coords = CITY_COORDS[city];
      if (!coords) return null;
      return {
        lat: coords.lat,
        lng: coords.lng,
        label: `${city} (${count} dreamer${count > 1 ? "s" : ""})`,
        count,
        color: "#8b5cf6",
      };
    })
    .filter(Boolean) as { lat: number; lng: number; label: string; count: number; color: string }[];

  // Build arcs for accepted matches
  const acceptedMatches = matches.filter((m) => m.status === "accepted");
  const myCoords = CITY_COORDS[currentUser.city];
  const arcs = acceptedMatches
    .map((m) => {
      const partnerCoords = CITY_COORDS[m.profile.city];
      if (!myCoords || !partnerCoords) return null;
      return {
        startLat: myCoords.lat,
        startLng: myCoords.lng,
        endLat: partnerCoords.lat,
        endLng: partnerCoords.lng,
        color: "#22c55e",
      };
    })
    .filter(Boolean) as { startLat: number; startLng: number; endLat: number; endLng: number; color: string }[];

  // Region stats
  const regions: Record<string, number> = {};
  for (const p of allProfiles) {
    const country = p.country || "Unknown";
    regions[country] = (regions[country] ?? 0) + 1;
  }
  const sortedRegions = Object.entries(regions).sort((a, b) => b[1] - a[1]);

  return (
    <div className="relative h-[calc(100vh-4rem)] overflow-hidden bg-gray-950">
      {/* Back button */}
      <div className="absolute left-4 top-4 z-10">
        <Link
          href="/explore"
          className="flex items-center gap-1 rounded-full bg-gray-900/80 px-3 py-1.5 text-sm text-gray-300 backdrop-blur-sm hover:bg-gray-800"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>
      </div>

      {/* Globe */}
      <DreamGlobe points={points} arcs={arcs} />

      {/* Sidebar stats */}
      <div className="absolute right-4 top-4 z-10 w-56 rounded-[12px] bg-gray-900/80 p-4 backdrop-blur-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-200">
          Dreamers by Region
        </h3>
        <div className="space-y-2">
          {sortedRegions.slice(0, 8).map(([country, count]) => (
            <div key={country} className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{country}</span>
              <span className="text-xs font-medium text-brand-400">
                {count}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-gray-700 pt-3">
          <p className="text-xs text-gray-500">
            {allProfiles.length} dreamers worldwide
          </p>
        </div>
      </div>
    </div>
  );
}
