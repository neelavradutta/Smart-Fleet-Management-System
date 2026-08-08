import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { auditLogs, drivers } from "@sfms/db";
import { createDriverSchema, updateDriverSchema } from "@sfms/shared";
import { db } from "../lib/db.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const driversRouter = Router();

driversRouter.get("/", async (req: AuthedRequest, res) => {
  const rows = await db
    .select()
    .from(drivers)
    .where(eq(drivers.fleetId, req.fleetId!))
    .orderBy(desc(drivers.createdAt));
  res.json({ data: rows });
});

driversRouter.get("/:id", async (req: AuthedRequest, res) => {
  const [row] = await db
    .select()
    .from(drivers)
    .where(and(eq(drivers.id, req.params.id), eq(drivers.fleetId, req.fleetId!)))
    .limit(1);

  if (!row) return res.status(404).json({ error: "Driver not found" });
  res.json({ data: row });
});

driversRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createDriverSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const [row] = await db
    .insert(drivers)
    .values({
      fleetId: req.fleetId!,
      email: parsed.data.email,
      phone: parsed.data.phone,
      fullName: parsed.data.fullName,
      licenseNumber: parsed.data.licenseNumber,
      licenseExpiry: parsed.data.licenseExpiry,
      status: parsed.data.status,
      assignedVehicleId: parsed.data.assignedVehicleId ?? null,
    })
    .returning();

  await db.insert(auditLogs).values({
    fleetId: req.fleetId!,
    actorUserId: req.userId,
    action: "driver.create",
    entityType: "driver",
    entityId: row.id,
  });

  res.status(201).json({ data: row });
});

driversRouter.patch("/:id", async (req: AuthedRequest, res) => {
  const parsed = updateDriverSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const [row] = await db
    .update(drivers)
    .set({
      ...parsed.data,
      assignedVehicleId: parsed.data.assignedVehicleId ?? undefined,
    })
    .where(and(eq(drivers.id, req.params.id), eq(drivers.fleetId, req.fleetId!)))
    .returning();

  if (!row) return res.status(404).json({ error: "Driver not found" });
  res.json({ data: row });
});
