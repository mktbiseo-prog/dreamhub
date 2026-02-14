// ---------------------------------------------------------------------------
// Global Region Router
//
// Ref: docs/dream_hub_unified_algorithmic_blueprint.md §14.3
//
// Routes users to the nearest cloud region for reads (local replica)
// while writes go through global consensus (Raft/Paxos).
//
// Regions:
//   ap-northeast-2 — Seoul
//   us-east-1      — New York / Virginia
//   eu-central-1   — Frankfurt
// ---------------------------------------------------------------------------

import type { RegionId, GeoLocation, RegionRoute } from "./types";

/** Region metadata with data center coordinates */
interface RegionInfo {
  id: RegionId;
  name: string;
  location: GeoLocation;
}

/** Available cloud regions */
const REGIONS: RegionInfo[] = [
  {
    id: "ap-northeast-2",
    name: "Seoul",
    location: { latitude: 37.5665, longitude: 126.9780 },
  },
  {
    id: "us-east-1",
    name: "New York (Virginia)",
    location: { latitude: 38.9519, longitude: -77.4480 },
  },
  {
    id: "eu-central-1",
    name: "Frankfurt",
    location: { latitude: 50.1109, longitude: 8.6821 },
  },
];

/**
 * Compute the great-circle distance between two points using the
 * Haversine formula.
 *
 * @returns Distance in kilometers
 */
export function haversineDistance(a: GeoLocation, b: GeoLocation): number {
  const R = 6371; // Earth's mean radius in km

  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;

  const sinHalfLat = Math.sin(dLat / 2);
  const sinHalfLon = Math.sin(dLon / 2);

  const h =
    sinHalfLat * sinHalfLat +
    Math.cos(lat1) * Math.cos(lat2) * sinHalfLon * sinHalfLon;

  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Route a user to the nearest cloud region based on their geographic location.
 *
 * §14.3: "읽기(Read): 각 주요 리전에 읽기 전용 복제본을 배치.
 * 쓰기(Write): 분산 합의를 통해 글로벌 일관성 유지."
 *
 * @param userLocation - User's geographic coordinates
 * @returns Region routing decision with read/write strategies
 */
export function routeToRegion(userLocation: GeoLocation): RegionRoute {
  let bestRegion = REGIONS[0];
  let bestDistance = haversineDistance(userLocation, REGIONS[0].location);

  for (let i = 1; i < REGIONS.length; i++) {
    const d = haversineDistance(userLocation, REGIONS[i].location);
    if (d < bestDistance) {
      bestDistance = d;
      bestRegion = REGIONS[i];
    }
  }

  return {
    region: bestRegion.id,
    regionName: bestRegion.name,
    distanceKm: Math.round(bestDistance),
    readFrom: "local_replica",
    writeTo: "global_consensus",
  };
}

/**
 * Get the list of all available regions.
 */
export function getAvailableRegions(): Array<{
  id: RegionId;
  name: string;
  location: GeoLocation;
}> {
  return REGIONS.map((r) => ({ ...r, location: { ...r.location } }));
}
