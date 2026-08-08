import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { auditLogs, vehicles } from "@sfms/db";
import { createVehicleSchema, updateVehicleSchema } from "@sfms/shared";
import { db } from "../lib/db.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const vehiclesRouter = Router();

vehiclesRouter.get("/", async (req: AuthedRequest, res) => {
  const rows = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.fleetId, req.fleetId!))
    .orderBy(desc(vehicles.createdAt));
  res.json({ data: rows });
});

vehiclesRouter.get("/:id", async (req: AuthedRequest, res) => {
  const [row] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, req.params.id), eq(vehicles.fleetId, req.fleetId!)))
    .limit(1);

  if (!row) return res.status(404).json({ error: "Vehicle not found" });
  res.json({ data: row });
});

vehiclesRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const [row] = await db
    .insert(vehicles)
    .values({
      fleetId: req.fleetId!,
      vehicleNumber: parsed.data.vehicleNumber,
      vehicleType: parsed.data.vehicleType,
      make: parsed.data.make,
      model: parsed.data.model,
      year: parsed.data.year,
      licensePlate: parsed.data.licensePlate,
      vin: parsed.data.vin,
      capacityWeightKg: parsed.data.capacityWeightKg,
      capacityVolumeM3: parsed.data.capacityVolumeM3?.toString(),
      status: parsed.data.status,
    })
    .returning();

  await db.insert(auditLogs).values({
    fleetId: req.fleetId!,
    actorUserId: req.userId,
    action: "vehicle.create",
    entityType: "vehicle",
    entityId: row.id,
  });

  res.status(201).json({ data: row });
});

vehiclesRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const parsed = updateVehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const [row] = await db
    .update(vehicles)
    .set({
      ...parsed.data,
      capacityVolumeM3: parsed.data.capacityVolumeM3?.toString(),
      updatedAt: new Date(),
    })
    .where(and(eq(vehicles.id, req.params.id), eq(vehicles.fleetId, req.fleetId!)))
    .returning();

  if (!row) return res.status(404).json({ error: "Vehicle not found" });
  res.json({ data: row });
});
