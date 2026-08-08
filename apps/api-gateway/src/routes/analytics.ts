import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import {
  drivers,
  fuelReadings,
  routes,
  shipments,
  vehicles,
} from "@sfms/db";
import { customReportSchema, estimateCo2Kg } from "@sfms/shared";
import { db } from "../lib/db.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const analyticsRouter = Router();

analyticsRouter.get("/fleet-overview", async (req: AuthedRequest, res) => {
  const fleetId = req.fleetId!;
  const [v] = await db
    .select({
      total: sql<number>`count(*)`,
      active: sql<number>`count(*) filter (where ${vehicles.status} = 'ACTIVE')`,
    })
    .from(vehicles)
    .where(eq(vehicles.fleetId, fleetId));

  const [d] = await db
    .select({
      total: sql<number>`count(*)`,
      avgSafety: sql<number>`coalesce(avg(${drivers.safetyScore}::numeric), 100)`,
    })
    .from(drivers)
    .where(eq(drivers.fleetId, fleetId));

  const [s] = await db
    .select({
      total: sql<number>`count(*)`,
      delivered: sql<number>`count(*) filter (where ${shipments.shipmentStatus} = 'DELIVERED')`,
    })
    .from(shipments)
    .where(eq(shipments.fleetId, fleetId));

  const [r] = await db
    .select({
      distance: sql<number>`coalesce(sum(${routes.plannedDistanceKm}::numeric), 0)`,
      co2: sql<number>`coalesce(sum(${routes.co2Kg}::numeric), 0)`,
    })
    .from(routes)
    .where(eq(routes.fleetId, fleetId));

  const onTime =
    Number(s?.total || 0) === 0
      ? 100
      : (Number(s?.delivered || 0) / Number(s.total)) * 100;

  res.json({
    data: {
      totalVehicles: Number(v?.total ?? 0),
      activeVehicles: Number(v?.active ?? 0),
      totalDrivers: Number(d?.total ?? 0),
      avgSafetyScore: Number(d?.avgSafety ?? 100),
      onTimeDeliveryRate: onTime,
      totalDistanceKm: Number(r?.distance ?? 0),
      totalCo2Kg: Number(r?.co2 ?? 0),
      avgUtilization: Number(v?.total)
        ? (Number(v?.active) / Number(v.total)) * 100
        : 0,
      avgCostPerKm: 18.5,
    },
  });
});

analyticsRouter.get("/predictions/capacity", async (req: AuthedRequest, res) => {
  const days = Number(req.query.days ?? 7);
  const [v] = await db
    .select({ total: sql<number>`count(*)` })
    .from(vehicles)
    .where(eq(vehicles.fleetId, req.fleetId!));

  const capacity = Number(v?.total ?? 0) * 12;
  res.json({
    data: {
      horizonDays: days,
      predictedDeliveries: Math.round(capacity * days * 0.75),
      availableVehicleDays: Number(v?.total ?? 0) * days,
      recommendation: "Add 1 van if demand rises >15%",
    },
  });
});

analyticsRouter.get("/vehicle/:id/performance", async (req: AuthedRequest, res) => {
  const routeRows = await db
    .select()
    .from(routes)
    .where(eq(routes.vehicleId, req.params.id));

  const fuel = await db
    .select()
    .from(fuelReadings)
    .where(eq(fuelReadings.vehicleId, req.params.id))
    .limit(20);

  const distance = routeRows.reduce(
    (s, r) => s + Number(r.plannedDistanceKm ?? 0),
    0,
  );

  res.json({
    data: {
      vehicleId: req.params.id,
      routesCompleted: routeRows.filter((r) => r.routeStatus === "COMPLETED")
        .length,
      distanceKm: distance,
      co2Kg: estimateCo2Kg(distance),
      fuelSamples: fuel.length,
    },
  });
});

analyticsRouter.post("/custom-report", async (req: AuthedRequest, res) => {
  const parsed = customReportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const overview = await db
    .select({
      distance: sql<number>`coalesce(sum(${routes.plannedDistanceKm}::numeric), 0)`,
      co2: sql<number>`coalesce(sum(${routes.co2Kg}::numeric), 0)`,
      routes: sql<number>`count(*)`,
    })
    .from(routes)
    .where(eq(routes.fleetId, req.fleetId!));

  const rows = [
    {
      group: parsed.data.groupBy,
      distance: Number(overview[0]?.distance ?? 0),
      co2: Number(overview[0]?.co2 ?? 0),
      routes: Number(overview[0]?.routes ?? 0),
      metrics: parsed.data.metrics,
    },
  ];

  if (parsed.data.format === "csv") {
    const header = Object.keys(rows[0]).join(",");
    const line = Object.values(rows[0]).join(",");
    res.type("text/csv").send(`${header}\n${line}\n`);
    return;
  }

  res.json({ data: rows, rows: rows.length });
});

analyticsRouter.get("/esg", async (req: AuthedRequest, res) => {
  const [r] = await db
    .select({
      distance: sql<number>`coalesce(sum(${routes.plannedDistanceKm}::numeric), 0)`,
      co2: sql<number>`coalesce(sum(${routes.co2Kg}::numeric), 0)`,
    })
    .from(routes)
    .where(eq(routes.fleetId, req.fleetId!));

  const distance = Number(r?.distance ?? 0);
  const co2 = Number(r?.co2 ?? 0);
  const esgScore = Math.max(0, 100 - co2 / Math.max(distance, 1));

  res.json({
    data: {
      totalDistanceKm: distance,
      totalCo2Kg: co2,
      esgScore: Number(esgScore.toFixed(1)),
      greenRouteHint: "Prefer shorter optimized routes to cut CO2 10-15%",
      carbonOffsetsKg: Math.round(co2 * 0.1),
    },
  });
});
