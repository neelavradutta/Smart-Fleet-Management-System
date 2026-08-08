/** Haversine distance in km */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** ETA minutes from remaining km + speed km/h. Null if stopped. */
export function etaMinutesFrom(distanceKm: number, speedKmh: number): number | null {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0) return 0;
  if (!Number.isFinite(speedKmh) || speedKmh < 3) return null;
  return (distanceKm / speedKmh) * 60;
}

/** Demo delivery targets around Mumbai (cycle by vehicle index) */
export const DELIVERY_HUBS: [number, number][] = [
  [19.0596, 72.8295], // Bandra West
  [19.1197, 72.8464], // Andheri
  [19.0759, 72.8774], // CST / south
  [19.2183, 72.9781], // Thane edge
];
