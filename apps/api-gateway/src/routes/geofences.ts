import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { auditLogs, geofences } from "@sfms/db";
import { createGeofenceSchema } from "@sfms/shared";
import { db } from "../lib/db.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const geofencesRouter = Router();

geofencesRouter.get("/", async (req: AuthedRequest, res) => {
  const rows = await db
    .select()
    .from(geofences)
    .where(eq(geofences.fleetId, req.fleetId!))
    .orderBy(desc(geofences.createdAt));
  res.json({ data: rows });
});

geofencesRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createGeofenceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const [row] = await db
    .insert(geofences)
    .values({
      fleetId: req.fleetId!,
      name: parsed.data.name,
      geofenceType: parsed.data.geofenceType,
      centerLatitude: parsed.data.centerLatitude.toFixed(6),
      centerLongitude: parsed.data.centerLongitude.toFixed(6),
      radiusMeters: parsed.data.radiusMeters,
      isActive: parsed.data.isActive,
    })
    .returning();

  await db.insert(auditLogs).values({
    fleetId: req.fleetId!,
    actorUserId: req.userId,
    action: "geofence.create",
    entityType: "geofence",
    entityId: row.id,
  });

  res.status(201).json({ data: row });
});

geofencesRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const [row] = await db
    .delete(geofences)
    .where(and(eq(geofences.id, req.params.id), eq(geofences.fleetId, req.fleetId!)))
    .returning();
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json({ data: row });
});
