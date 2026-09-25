import { Coordinates } from '@/types';

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates great-circle distance between two coordinate pairs using Haversine formula.
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const lat1 = toRadians(coord1.latitude);
  const lat2 = toRadians(coord2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Format distance into a calm, human-friendly band without exposing exact metrics.
 */
export function formatDistanceBand(distanceKm: number, corridorName?: string): string {
  if (distanceKm < 0.3) {
    return 'Immediate vicinity (under 300m)';
  }
  if (distanceKm < 1.0) {
    const meters = Math.round(distanceKm * 1000);
    return `Within ${meters}m`;
  }
  if (distanceKm <= 5.0) {
    const formatted = distanceKm.toFixed(1);
    return corridorName ? `${formatted} km away (${corridorName})` : `${formatted} km away`;
  }
  const formatted = distanceKm.toFixed(1);
  return `Outside primary perimeter (${formatted} km away)`;
}

/**
 * Checks if a user's location is within the 5 km crisis alert perimeter.
 */
export function isWithinNotificationPerimeter(
  userCoord: Coordinates,
  incidentCoord: Coordinates,
  maxRadiusKm = 5.0
): boolean {
  const distance = calculateHaversineDistance(userCoord, incidentCoord);
  return distance <= maxRadiusKm;
}

/**
 * Incident linking threshold: 1.5 km clustering radius.
 */
export function isWithinClusterRadius(
  coord1: Coordinates,
  coord2: Coordinates,
  clusterRadiusKm = 1.5
): boolean {
  return calculateHaversineDistance(coord1, coord2) <= clusterRadiusKm;
}

/**
 * Masks exact private GPS coordinates for public responses (rounds to 2 decimals, ~1.1km area).
 */
export function maskCoordinates(coord: Coordinates): Coordinates {
  return {
    latitude: Math.round(coord.latitude * 100) / 100,
    longitude: Math.round(coord.longitude * 100) / 100,
  };
}
