import { and, eq } from "drizzle-orm";
import { geofences } from "@sfms/db";
import { pointInCircle } from "@sfms/shared";
import { db } from "./db.js";

export async function checkGeofenceViolations(
  fleetId: string,
  vehicleId: string,
  lat: number,
  lng: number,
) {
  const fences = await db
    .select()
    .from(geofences)
    .where(and(eq(geofences.fleetId, fleetId), eq(geofences.isActive, true)));

  const hits: Array<{ id: string; name: string; geofenceType: string }> = [];

  for (const f of fences) {
    if (!f.centerLatitude || !f.centerLongitude || !f.radiusMeters) continue;
    const inside = pointInCircle(
      lat,
      lng,
      Number(f.centerLatitude),
      Number(f.centerLongitude),
      f.radiusMeters,
    );
    // Restricted zones: alert when INSIDE. Depot/customer: alert when outside after enter — MVP: RESTRICTED inside
    if (f.geofenceType === "RESTRICTED" && inside) {
      hits.push({ id: f.id, name: f.name, geofenceType: f.geofenceType });
    }
  }

  return hits;
}
