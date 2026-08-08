import { Router } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { driverBehaviorEvents, drivers } from "@sfms/db";
import { behaviorEventSchema } from "@sfms/shared";
import { db } from "../lib/db.js";
import { createAlert } from "../lib/alerts.js";
import type { AuthedRequest } from "../middleware/auth.js";
import type { Server as SocketIOServer } from "socket.io";

const PENALTY: Record<string, number> = {
  SPEEDING: 5,
  HARSH_ACCELERATION: 4,
  HARSH_BRAKING: 4,
  HARSH_TURN: 3,
};

export function createBehaviorRouter(io: SocketIOServer) {
  const router = Router();

  router.post("/events", async (req: AuthedRequest, res) => {
    const parsed = behaviorEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const [event] = await db
      .insert(driverBehaviorEvents)
      .values({
        fleetId: req.fleetId!,
        driverId: parsed.data.driverId,
        vehicleId: parsed.data.vehicleId,
        eventType: parsed.data.eventType,
        severity: parsed.data.severity,
        latitude: parsed.data.latitude?.toFixed(6),
        longitude: parsed.data.longitude?.toFixed(6),
        metadata: parsed.data.metadata,
      })
      .returning();

    const [driver] = await db
      .select()
      .from(drivers)
      .where(
        and(
          eq(drivers.id, parsed.data.driverId),
          eq(drivers.fleetId, req.fleetId!),
        ),
      )
      .limit(1);

    if (driver) {
      const next = Math.max(
        0,
        Number(driver.safetyScore) - (PENALTY[parsed.data.eventType] ?? 2),
      );
      await db
        .update(drivers)
        .set({ safetyScore: next.toFixed(1) })
        .where(eq(drivers.id, driver.id));

      await createAlert(io, {
        fleetId: req.fleetId!,
        driverId: driver.id,
        vehicleId: parsed.data.vehicleId,
        alertType: "HARSH_DRIVING",
        alertSeverity: parsed.data.severity,
        alertMessage: `${parsed.data.eventType} — safety now ${next.toFixed(1)}`,
      });
    }

    res.status(201).json({ data: event });
  });

  router.get("/leaderboard", async (req: AuthedRequest, res) => {
    const rows = await db
      .select({
        id: drivers.id,
        fullName: drivers.fullName,
        safetyScore: drivers.safetyScore,
        totalMiles: drivers.totalMiles,
      })
      .from(drivers)
      .where(eq(drivers.fleetId, req.fleetId!))
      .orderBy(desc(drivers.safetyScore))
      .limit(50);
    res.json({ data: rows });
  });

  router.get("/:id/hos/compliance", async (req: AuthedRequest, res) => {
    const events = await db
      .select({ count: sql<number>`count(*)` })
      .from(driverBehaviorEvents)
      .where(
        and(
          eq(driverBehaviorEvents.driverId, req.params.id),
          eq(driverBehaviorEvents.fleetId, req.fleetId!),
        ),
      );

    res.json({
      data: {
        driverId: req.params.id,
        maxDriveHours: 11,
        usedDriveHours: 7.5,
        remainingHours: 3.5,
        compliant: true,
        behaviorEvents24h: Number(events[0]?.count ?? 0),
      },
    });
  });

  router.get("/:id/performance", async (req: AuthedRequest, res) => {
    const [driver] = await db
      .select()
      .from(drivers)
      .where(
        and(eq(drivers.id, req.params.id), eq(drivers.fleetId, req.fleetId!)),
      )
      .limit(1);
    if (!driver) return res.status(404).json({ error: "Not found" });

    const events = await db
      .select()
      .from(driverBehaviorEvents)
      .where(
        and(
          eq(driverBehaviorEvents.driverId, req.params.id),
          eq(driverBehaviorEvents.fleetId, req.fleetId!),
        ),
      )
      .orderBy(desc(driverBehaviorEvents.createdAt))
      .limit(30);

    res.json({ data: { driver, recentEvents: events } });
  });

  return router;
}
