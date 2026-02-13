"use client";

import { useEffect, useRef, useState } from "react";

interface GlobePoint {
  lat: number;
  lng: number;
  label: string;
  count: number;
  color: string;
}

interface DreamGlobeProps {
  points: GlobePoint[];
  arcs?: { startLat: number; startLng: number; endLat: number; endLng: number; color: string }[];
}

// City coordinates for mock data
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "Seoul": { lat: 37.5665, lng: 126.9780 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  "Berlin": { lat: 52.5200, lng: 13.4050 },
  "Tokyo": { lat: 35.6762, lng: 139.6503 },
  "Lagos": { lat: 6.5244, lng: 3.3792 },
  "Helsinki": { lat: 60.1699, lng: 24.9384 },
  "Mumbai": { lat: 19.0760, lng: 72.8777 },
  "Warsaw": { lat: 52.2297, lng: 21.0122 },
};

export { CITY_COORDS };

export function DreamGlobe({ points, arcs = [] }: DreamGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [Globe, setGlobe] = useState<any>(null);

  useEffect(() => {
    // Dynamically import react-globe.gl (it uses Three.js which needs client-side only)
    import("react-globe.gl").then((mod) => {
      setGlobe(() => mod.default);
    });
  }, []);

  if (!Globe) {
    return (
      <div
        ref={mountRef}
        className="flex items-center justify-center"
        style={{ width: "100%", height: "100%" }}
      >
        <div className="text-center">
          <svg
            className="mx-auto h-8 w-8 animate-spin text-brand-500"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-400">Loading Globe...</p>
        </div>
      </div>
    );
  }

  return (
    <Globe
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      pointsData={points}
      pointLat="lat"
      pointLng="lng"
      pointLabel="label"
      pointAltitude={(d: GlobePoint) => Math.min(d.count * 0.05, 0.3)}
      pointRadius={(d: GlobePoint) => Math.max(d.count * 0.3, 0.5)}
      pointColor="color"
      arcsData={arcs}
      arcColor="color"
      arcDashLength={0.4}
      arcDashGap={0.2}
      arcDashAnimateTime={1500}
      arcStroke={0.5}
      atmosphereColor="#8b5cf6"
      atmosphereAltitude={0.25}
      width={typeof window !== "undefined" ? window.innerWidth : 800}
      height={typeof window !== "undefined" ? window.innerHeight - 64 : 600}
    />
  );
}
