import { Router } from "express";
import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { auditLogs, routes } from "@sfms/db";
import {
  createRouteSchema,
  estimateCo2Kg,
  haversineMeters,
  optimizeRouteSchema,
} from "@sfms/shared";
import { db } from "../lib/db.js";
import { redis } from "../lib/redis.js";
import { env } from "../env.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const routesRouter = Router();

routesRouter.get("/", async (req: AuthedRequest, res) => {
  const rows = await db
    .select()
    .from(routes)
    .where(eq(routes.fleetId, req.fleetId!))
    .orderBy(desc(routes.createdAt));
  res.json({ data: rows });
});

routesRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createRouteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  let distanceKm = 0;
  const stops = parsed.data.stops;
  for (let i = 1; i < stops.length; i++) {
    distanceKm +=
      haversineMeters(stops[i - 1].lat, stops[i - 1].lng, stops[i].lat, stops[i].lng) /
      1000;
  }

  const [row] = await db
    .insert(routes)
    .values({
      fleetId: req.fleetId!,
      vehicleId: parsed.data.vehicleId,
      driverId: parsed.data.driverId,
      routeType: parsed.data.routeType,
      routeStatus: "PLANNED",
      plannedDistanceKm: distanceKm.toFixed(2),
      plannedStartTime: parsed.data.plannedStartTime
        ? new Date(parsed.data.plannedStartTime)
        : null,
      plannedEndTime: parsed.data.plannedEndTime
        ? new Date(parsed.data.plannedEndTime)
        : null,
      totalStops: stops.length,
      co2Kg: estimateCo2Kg(distanceKm).toFixed(3),
      routeJson: { stops },
    })
    .returning();

  await db.insert(auditLogs).values({
    fleetId: req.fleetId!,
    actorUserId: req.userId,
    action: "route.create",
    entityType: "route",
    entityId: row.id,
  });

  res.status(201).json({ data: row });
});

routesRouter.post("/optimize", async (req: AuthedRequest, res) => {
  const parsed = optimizeRouteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const jobId = randomUUID();
  await redis.setex(
    `job:${jobId}`,
    3600,
    JSON.stringify({ status: "processing", createdAt: new Date().toISOString() }),
  );

  // Prefer Python OR-Tools service; fallback nearest-neighbor locally
  const optimizerUrl = process.env.ROUTE_OPTIMIZER_URL ?? "http://localhost:5001";
  try {
    const upstream = await fetch(`${optimizerUrl}/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...parsed.data, fleet_id: req.fleetId, job_id: jobId }),
    });
    if (upstream.ok) {
      const body = await upstream.json();
      return res.status(202).json(body);
    }
  } catch {
    // local fallback
  }

  const locs = parsed.data.deliveryLocations;
  const remaining = [...locs];
  let curLat = parsed.data.depotLat;
  let curLng = parsed.data.depotLng;
  const ordered: typeof locs = [];
  while (remaining.length) {
    remaining.sort(
      (a, b) =>
        haversineMeters(curLat, curLng, a.lat, a.lng) -
        haversineMeters(curLat, curLng, b.lat, b.lng),
    );
    const next = remaining.shift()!;
    ordered.push(next);
    curLat = next.lat;
    curLng = next.lng;
  }

  let distanceKm = 0;
  let prev = { lat: parsed.data.depotLat, lng: parsed.data.depotLng };
  for (const s of ordered) {
    distanceKm += haversineMeters(prev.lat, prev.lng, s.lat, s.lng) / 1000;
    prev = s;
  }

  const [row] = await db
    .insert(routes)
    .values({
      fleetId: req.fleetId!,
      vehicleId: parsed.data.vehicleIds[0],
      routeStatus: "PLANNED",
      plannedDistanceKm: distanceKm.toFixed(2),
      totalStops: ordered.length,
      optimizationScore: "85.0",
      co2Kg: estimateCo2Kg(distanceKm).toFixed(3),
      routeJson: {
        vehicleId: parsed.data.vehicleIds[0],
        stops: ordered,
        algorithm: "nearest-neighbor-fallback",
      },
    })
    .returning();

  const result = {
    status: "completed",
    jobId,
    routeId: row.id,
    totalDistance: distanceKm,
    routes: [row],
  };
  await redis.setex(`job:${jobId}`, 3600, JSON.stringify(result));
  res.status(202).json(result);
});

routesRouter.get("/jobs/:jobId", async (req: AuthedRequest, res) => {
  const raw = await redis.get(`job:${req.params.jobId}`);
  if (!raw) return res.status(404).json({ error: "Job not found" });
  res.json(JSON.parse(raw));
});

routesRouter.get("/:id/metrics", async (req: AuthedRequest, res) => {
  const [row] = await db
    .select()
    .from(routes)
    .where(and(eq(routes.id, req.params.id), eq(routes.fleetId, req.fleetId!)))
    .limit(1);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json({
    data: {
      plannedDistanceKm: row.plannedDistanceKm,
      actualDistanceKm: row.actualDistanceKm,
      optimizationScore: row.optimizationScore,
      co2Kg: row.co2Kg,
      efficiencyScore: row.efficiencyScore,
      gateway: env.port,
    },
  });
});
