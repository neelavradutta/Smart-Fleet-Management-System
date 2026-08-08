import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { fuelReadings, fleetSettings } from "@sfms/db";
import { fuelTelemetrySchema } from "@sfms/shared";
import { db } from "../lib/db.js";
import { createAlert } from "../lib/alerts.js";
import type { AuthedRequest } from "../middleware/auth.js";
import type { Server as SocketIOServer } from "socket.io";

export function createFuelRouter(io: SocketIOServer) {
  const router = Router();

  router.post("/", async (req: AuthedRequest, res) => {
    const parsed = fuelTelemetrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const [prev] = await db
      .select()
      .from(fuelReadings)
      .where(
        and(
          eq(fuelReadings.vehicleId, parsed.data.vehicleId),
          eq(fuelReadings.fleetId, req.fleetId!),
        ),
      )
      .orderBy(desc(fuelReadings.createdAt))
      .limit(1);

    const [row] = await db
      .insert(fuelReadings)
      .values({
        fleetId: req.fleetId!,
        vehicleId: parsed.data.vehicleId,
        fuelLevel: parsed.data.fuelLevel.toFixed(2),
        odometerKm: parsed.data.odometerKm?.toString(),
      })
      .returning();

    if (prev) {
      const drop = Number(prev.fuelLevel) - parsed.data.fuelLevel;
      if (drop > 15) {
        await createAlert(io, {
          fleetId: req.fleetId!,
          vehicleId: parsed.data.vehicleId,
          alertType: "FUEL_ANOMALY",
          alertSeverity: "CRITICAL",
          alertMessage: `Sudden fuel drop ${drop.toFixed(1)}% — possible theft/leak`,
          alertData: { previous: prev.fuelLevel, current: parsed.data.fuelLevel },
        });
      }
    }

    res.status(201).json({ data: row });
  });

  router.get("/vehicles/:id/efficiency", async (req: AuthedRequest, res) => {
    const rows = await db
      .select()
      .from(fuelReadings)
      .where(
        and(
          eq(fuelReadings.vehicleId, req.params.id),
          eq(fuelReadings.fleetId, req.fleetId!),
        ),
      )
      .orderBy(desc(fuelReadings.createdAt))
      .limit(50);

    const levels = rows.map((r) => Number(r.fuelLevel));
    const avg = levels.length
      ? levels.reduce((a, b) => a + b, 0) / levels.length
      : 0;

    res.json({
      data: {
        samples: rows.length,
        avgFuelLevel: avg,
        latest: rows[0] ?? null,
        lPer100kmEstimate: 12.5,
      },
    });
  });

  router.get("/fleet-report", async (req: AuthedRequest, res) => {
    const rows = await db
      .select()
      .from(fuelReadings)
      .where(eq(fuelReadings.fleetId, req.fleetId!))
      .orderBy(desc(fuelReadings.createdAt))
      .limit(500);

    const [settings] = await db
      .select()
      .from(fleetSettings)
      .where(eq(fleetSettings.fleetId, req.fleetId!))
      .limit(1);

    res.json({
      data: {
        readings: rows.length,
        thresholdHint: settings?.alertThresholds ?? {},
        avgLevel:
          rows.reduce((s, r) => s + Number(r.fuelLevel), 0) /
          (rows.length || 1),
      },
    });
  });

  return router;
}
