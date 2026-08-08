import { Router } from "express";
import { and, eq, sql } from "drizzle-orm";
import { fleetSettings, vehicles } from "@sfms/db";
import {
  fuelTelemetrySchema,
  gpsTelemetrySchema,
  obdTelemetrySchema,
} from "@sfms/shared";
import { db } from "../lib/db.js";
import { redis } from "../lib/redis.js";
import { checkGeofenceViolations } from "../lib/geofence.js";
import { createAlert } from "../lib/alerts.js";
import type { AuthedRequest } from "../middleware/auth.js";
import type { Server as SocketIOServer } from "socket.io";

export function createTelemetryRouter(io: SocketIOServer) {
  const router = Router();

  router.post("/gps", async (req: AuthedRequest, res) => {
    const parsed = gpsTelemetrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const data = parsed.data;
    const [vehicle] = await db
      .select({ id: vehicles.id })
      .from(vehicles)
      .where(
        and(eq(vehicles.id, data.vehicleId), eq(vehicles.fleetId, req.fleetId!)),
      )
      .limit(1);

    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found for tenant" });
    }

    const timestamp = data.timestamp ?? new Date().toISOString();
    const payload = {
      vehicleId: data.vehicleId,
      fleetId: req.fleetId!,
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed ?? 0,
      heading: data.heading ?? 0,
      altitude: data.altitude,
      accuracy: data.accuracy,
      timestamp,
    };

    try {
      await redis.set(
        `vehicle:${data.vehicleId}:location`,
        JSON.stringify(payload),
        "EX",
        300,
      );
      await redis.lpush(
        `telemetry:batch:${req.fleetId}`,
        JSON.stringify(payload),
      );
      await redis.lpush(
        `kafka:buffer:vehicle-telemetry`,
        JSON.stringify({ topic: "vehicle-telemetry", ...payload }),
      );
    } catch {
      // Redis optional
    }

    await db
      .update(vehicles)
      .set({
        currentLatitude: data.latitude.toFixed(6),
        currentLongitude: data.longitude.toFixed(6),
        lastLocationUpdate: new Date(timestamp),
        updatedAt: new Date(),
      })
      .where(eq(vehicles.id, data.vehicleId));

    const [settings] = await db
      .select()
      .from(fleetSettings)
      .where(eq(fleetSettings.fleetId, req.fleetId!))
      .limit(1);

    const speedLimit =
      Number(settings?.alertThresholds?.speeding_threshold ?? 80) || 80;
    if ((data.speed ?? 0) > speedLimit) {
      await createAlert(io, {
        fleetId: req.fleetId!,
        vehicleId: data.vehicleId,
        alertType: "HARSH_DRIVING",
        alertSeverity: "WARNING",
        alertMessage: `Speeding ${data.speed} > ${speedLimit}`,
        alertData: { speed: data.speed, limit: speedLimit },
      });
    }

    const violations = await checkGeofenceViolations(
      req.fleetId!,
      data.vehicleId,
      data.latitude,
      data.longitude,
    );
    for (const v of violations) {
      await createAlert(io, {
        fleetId: req.fleetId!,
        vehicleId: data.vehicleId,
        alertType: "GEOFENCE_VIOLATION",
        alertSeverity: "CRITICAL",
        alertMessage: `Entered restricted geofence ${v.name}`,
        alertData: v,
      });
    }

    // GPS spoof heuristic: impossible jump
    try {
      const prevRaw = await redis.get(`vehicle:${data.vehicleId}:prev`);
      if (prevRaw) {
        const prev = JSON.parse(prevRaw) as {
          latitude: number;
          longitude: number;
          timestamp: string;
        };
        const dt =
          (new Date(timestamp).getTime() - new Date(prev.timestamp).getTime()) /
          1000;
        if (dt > 0 && dt < 60) {
          const dist =
            Math.hypot(
              data.latitude - prev.latitude,
              data.longitude - prev.longitude,
            ) * 111_000;
          const speedMs = dist / dt;
          if (speedMs > 70) {
            await createAlert(io, {
              fleetId: req.fleetId!,
              vehicleId: data.vehicleId,
              alertType: "BREAKDOWN",
              alertSeverity: "WARNING",
              alertMessage: "Possible GPS spoofing / location jump",
              alertData: { speedMs, dist },
            });
          }
        }
      }
      await redis.set(
        `vehicle:${data.vehicleId}:prev`,
        JSON.stringify(payload),
        "EX",
        600,
      );
    } catch {
      // ignore
    }

    io.to(`vehicle:${data.vehicleId}:tracking`).emit("location_update", payload);
    io.to(`fleet:${req.fleetId}:tracking`).emit("location_update", payload);

    res.json({ success: true, geofenceHits: violations.length });
  });

  router.post("/fuel", async (req: AuthedRequest, res) => {
    const parsed = fuelTelemetrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    req.url = "/";
    // delegate shape — write into timescale via batch + fuel table via fuel router preferred
    res.status(202).json({
      success: true,
      hint: "Prefer POST /api/v1/fuel for anomaly detection",
      received: parsed.data,
    });
  });

  router.post("/obd", async (req: AuthedRequest, res) => {
    const parsed = obdTelemetrySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    try {
      await redis.lpush(
        `kafka:buffer:obd-data`,
        JSON.stringify({ topic: "obd-data", fleetId: req.fleetId, ...parsed.data }),
      );
    } catch {
      // ignore
    }

    if (parsed.data.faultCode) {
      await createAlert(io, {
        fleetId: req.fleetId!,
        vehicleId: parsed.data.vehicleId,
        alertType: "MAINTENANCE_DUE",
        alertSeverity: "WARNING",
        alertMessage: `OBD fault ${parsed.data.faultCode}`,
        alertData: parsed.data,
      });
    }

    res.json({ success: true });
  });

  router.get("/vehicles/:id/location/current", async (req: AuthedRequest, res) => {
    try {
      const cached = await redis.get(`vehicle:${req.params.id}:location`);
      if (cached) {
        return res.json({ data: JSON.parse(cached) });
      }
    } catch {
      // fall through
    }

    const [vehicle] = await db
      .select({
        id: vehicles.id,
        latitude: vehicles.currentLatitude,
        longitude: vehicles.currentLongitude,
        lastLocationUpdate: vehicles.lastLocationUpdate,
      })
      .from(vehicles)
      .where(
        and(eq(vehicles.id, req.params.id), eq(vehicles.fleetId, req.fleetId!)),
      )
      .limit(1);

    if (!vehicle?.latitude || !vehicle.longitude) {
      return res.status(404).json({ error: "No location" });
    }

    res.json({
      data: {
        vehicleId: vehicle.id,
        latitude: Number(vehicle.latitude),
        longitude: Number(vehicle.longitude),
        timestamp: vehicle.lastLocationUpdate,
      },
    });
  });

  router.get("/vehicles/:id/location/trail", async (req: AuthedRequest, res) => {
    const hours = Number(req.query.hours ?? 24);
    const result = await db.execute(sql`
      SELECT time, latitude, longitude, speed, heading
      FROM vehicle_telemetry
      WHERE vehicle_id = ${req.params.id}::uuid
        AND fleet_id = ${req.fleetId!}::uuid
        AND time > NOW() - (${hours}::text || ' hours')::interval
      ORDER BY time ASC
      LIMIT 5000
    `);

    res.json({ data: result });
  });

  setInterval(async () => {
    try {
      const keys = await redis.keys("telemetry:batch:*");
      for (const key of keys) {
        const records = await redis.lrange(key, 0, -1);
        if (!records.length) continue;

        for (const raw of records) {
          const r = JSON.parse(raw) as {
            timestamp: string;
            vehicleId: string;
            fleetId: string;
            latitude: number;
            longitude: number;
            speed: number;
            heading: number;
            altitude?: number;
            accuracy?: number;
          };
          await db.execute(sql`
            INSERT INTO vehicle_telemetry
              (time, vehicle_id, fleet_id, latitude, longitude, speed, heading, altitude, accuracy)
            VALUES
              (${r.timestamp}::timestamptz, ${r.vehicleId}::uuid, ${r.fleetId}::uuid,
               ${r.latitude}, ${r.longitude}, ${r.speed}, ${r.heading},
               ${r.altitude ?? null}, ${r.accuracy ?? null})
          `);
        }
        await redis.del(key);
      }
    } catch {
      // ignore batch flush errors in dev
    }
  }, 5000);

  return router;
}
