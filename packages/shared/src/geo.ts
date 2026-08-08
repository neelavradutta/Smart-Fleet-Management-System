/** Haversine distance in meters */
export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function pointInCircle(
  lat: number,
  lon: number,
  centerLat: number,
  centerLon: number,
  radiusMeters: number,
): boolean {
  return haversineMeters(lat, lon, centerLat, centerLon) <= radiusMeters;
}

/** CO2 kg ≈ distance_km × emission_factor + idle penalty */
export function estimateCo2Kg(
  distanceKm: number,
  emissionFactor = 0.21,
  idleMinutes = 0,
): number {
  return distanceKm * emissionFactor + idleMinutes * 0.05;
}
