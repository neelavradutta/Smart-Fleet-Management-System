import { Router } from "express";
import { eq } from "drizzle-orm";
import {
  alerts,
  drivers,
  shipments,
  vehicles,
} from "@sfms/db";
import { db } from "../lib/db.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const gdprRouter = Router();

gdprRouter.post("/export", async (req: AuthedRequest, res) => {
  const fleetId = req.fleetId!;
  const [v, d, s, a] = await Promise.all([
    db.select().from(vehicles).where(eq(vehicles.fleetId, fleetId)),
    db.select().from(drivers).where(eq(drivers.fleetId, fleetId)),
    db.select().from(shipments).where(eq(shipments.fleetId, fleetId)),
    db.select().from(alerts).where(eq(alerts.fleetId, fleetId)),
  ]);

  res.json({
    data: {
      exportedAt: new Date().toISOString(),
      fleetId,
      vehicles: v,
      drivers: d,
      shipments: s,
      alerts: a,
    },
  });
});
