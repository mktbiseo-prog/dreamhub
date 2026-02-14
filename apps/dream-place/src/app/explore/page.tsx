"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@dreamhub/ui";
import { DreamGlobe } from "@/components/place/DreamGlobe";
import type { GlobeDreamer } from "@/types";

// Mock dreamer data across multiple countries
const MOCK_GLOBE_DREAMERS: GlobeDreamer[] = [
  { lat: 37.5665, lng: 126.978, name: "Seoul", dreamCategory: "Technology", count: 42 },
  { lat: 37.7749, lng: -122.4194, name: "San Francisco", dreamCategory: "Technology", count: 67 },
  { lat: 35.6762, lng: 139.6503, name: "Tokyo", dreamCategory: "HealthTech", count: 38 },
  { lat: 52.52, lng: 13.405, name: "Berlin", dreamCategory: "E-Commerce", count: 29 },
  { lat: 6.5244, lng: 3.3792, name: "Lagos", dreamCategory: "FinTech", count: 24 },
  { lat: 60.1699, lng: 24.9384, name: "Helsinki", dreamCategory: "Climate Tech", count: 15 },
  { lat: 19.076, lng: 72.8777, name: "Mumbai", dreamCategory: "Music Tech", count: 31 },
  { lat: 52.2297, lng: 21.0122, name: "Warsaw", dreamCategory: "Productivity", count: 18 },
  { lat: 40.7128, lng: -74.006, name: "New York", dreamCategory: "FinTech", count: 55 },
  { lat: 51.5074, lng: -0.1278, name: "London", dreamCategory: "EdTech", count: 48 },
  { lat: -33.8688, lng: 151.2093, name: "Sydney", dreamCategory: "Climate Tech", count: 21 },
  { lat: 48.8566, lng: 2.3522, name: "Paris", dreamCategory: "E-Commerce", count: 33 },
  { lat: -23.5505, lng: -46.6333, name: "Sao Paulo", dreamCategory: "FinTech", count: 27 },
  { lat: 1.3521, lng: 103.8198, name: "Singapore", dreamCategory: "Technology", count: 36 },
  { lat: 55.7558, lng: 37.6173, name: "Moscow", dreamCategory: "Technology", count: 19 },
  { lat: 34.0522, lng: -118.2437, name: "Los Angeles", dreamCategory: "Music Tech", count: 41 },
  { lat: 31.2304, lng: 121.4737, name: "Shanghai", dreamCategory: "Technology", count: 52 },
  { lat: 28.6139, lng: 77.209, name: "Delhi", dreamCategory: "EdTech", count: 45 },
  { lat: -1.2921, lng: 36.8219, name: "Nairobi", dreamCategory: "FinTech", count: 16 },
  { lat: 43.6532, lng: -79.3832, name: "Toronto", dreamCategory: "HealthTech", count: 30 },
];

const DREAM_CATEGORIES = [
  "All",
  "Technology",
  "EdTech",
  "E-Commerce",
  "HealthTech",
  "FinTech",
  "Climate Tech",
  "Music Tech",
  "Productivity",
];

const SKILLS_FILTER = [
  "React / Next.js",
  "Machine Learning",
  "UI Design",
  "Node.js / Express",
  "Business Strategy",
  "Data Science / Analytics",
];

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minScore, setMinScore] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredDreamers = useMemo(() => {
    return MOCK_GLOBE_DREAMERS.filter((d) => {
      if (selectedCategory !== "All" && d.dreamCategory !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [selectedCategory]);

  // Sort nearby dreamers by count (simulating distance sorting)
  const nearbyDreamers = useMemo(() => {
    let filtered = [...filteredDreamers];
    if (selectedRegion) {
      // Simple region filtering based on approximate coordinates
      const regionBounds: Record<string, { latMin: number; latMax: number; lngMin: number; lngMax: number }> = {
        "North America": { latMin: 15, latMax: 72, lngMin: -170, lngMax: -50 },
        "South America": { latMin: -56, latMax: 15, lngMin: -82, lngMax: -34 },
        Europe: { latMin: 35, latMax: 72, lngMin: -10, lngMax: 40 },
        Africa: { latMin: -35, latMax: 37, lngMin: -18, lngMax: 52 },
        Asia: { latMin: -10, latMax: 75, lngMin: 40, lngMax: 180 },
        Oceania: { latMin: -47, latMax: -10, lngMin: 110, lngMax: 180 },
      };
      const bounds = regionBounds[selectedRegion];
      if (bounds) {
        filtered = filtered.filter(
          (d) =>
            d.lat >= bounds.latMin &&
            d.lat <= bounds.latMax &&
            d.lng >= bounds.lngMin &&
            d.lng <= bounds.lngMax,
        );
      }
    }
    return filtered.sort((a, b) => b.count - a.count);
  }, [filteredDreamers, selectedRegion]);

  const totalDreamers = nearbyDreamers.reduce((sum, d) => sum + d.count, 0);

  const handleRegionClick = useCallback((region: string) => {
    setSelectedRegion((prev) => (prev === region ? null : region));
  }, []);

  const toggleSkill = useCallback((skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-24">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Dream Globe
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Explore dreamers worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Globe */}
      <div className="mb-4">
        <DreamGlobe
          dreamers={filteredDreamers}
          onRegionClick={handleRegionClick}
        />
      </div>

      {/* Stats bar */}
      <div className="mb-4 flex items-center justify-between rounded-[8px] bg-gray-100 px-4 py-2.5 dark:bg-gray-900">
        <div>
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {totalDreamers}
          </span>
          <span className="ml-1.5 text-sm text-gray-500 dark:text-gray-400">
            dreamer{totalDreamers !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selectedRegion && (
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              {selectedRegion}
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-4 rounded-[12px] border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
          {/* Category filter */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Dream Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DREAM_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Skills filter */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Skills
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS_FILTER.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    selectedSkills.includes(skill)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Min score */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
              Min Match Score: {minScore}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>
      )}

      {/* Nearby dreamers list */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
          {selectedRegion ? `Dreamers in ${selectedRegion}` : "All Dreamers by City"}
        </h2>
        <div className="space-y-2">
          {nearbyDreamers.map((dreamer, i) => (
            <div
              key={`${dreamer.name}-${i}`}
              className="flex items-center gap-3 rounded-[8px] border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: `${
                    {
                      Technology: "#8b5cf6",
                      EdTech: "#3b82f6",
                      "E-Commerce": "#10b981",
                      HealthTech: "#ec4899",
                      FinTech: "#f59e0b",
                      "Climate Tech": "#22c55e",
                      "Music Tech": "#a855f7",
                      Productivity: "#6366f1",
                    }[dreamer.dreamCategory] ?? "#60a5fa"
                  }22`,
                }}
              >
                <svg
                  className="h-5 w-5"
                  style={{
                    color:
                      {
                        Technology: "#8b5cf6",
                        EdTech: "#3b82f6",
                        "E-Commerce": "#10b981",
                        HealthTech: "#ec4899",
                        FinTech: "#f59e0b",
                        "Climate Tech": "#22c55e",
                        "Music Tech": "#a855f7",
                        Productivity: "#6366f1",
                      }[dreamer.dreamCategory] ?? "#60a5fa",
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {dreamer.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {dreamer.dreamCategory}
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {dreamer.count}
                </span>
                <p className="text-[10px] text-gray-400">dreamers</p>
              </div>
            </div>
          ))}

          {nearbyDreamers.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-400 dark:text-gray-500">
                No dreamers found in this region
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => {
                  setSelectedRegion(null);
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
