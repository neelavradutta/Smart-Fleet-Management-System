import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { maintenanceRecords, vehicles } from "@sfms/db";
import { scheduleMaintenanceSchema } from "@sfms/shared";
import { db } from "../lib/db.js";
import { createAlert } from "../lib/alerts.js";
import type { AuthedRequest } from "../middleware/auth.js";
import type { Server as SocketIOServer } from "socket.io";

export function createMaintenanceRouter(io: SocketIOServer) {
  const router = Router();

  router.get("/report", async (req: AuthedRequest, res) => {
    const rows = await db
      .select()
      .from(maintenanceRecords)
      .where(eq(maintenanceRecords.fleetId, req.fleetId!))
      .orderBy(desc(maintenanceRecords.createdAt))
      .limit(200);
    res.json({ data: rows });
  });

  router.post("/schedule", async (req: AuthedRequest, res) => {
    const parsed = scheduleMaintenanceSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const [row] = await db
      .insert(maintenanceRecords)
      .values({
        fleetId: req.fleetId!,
        vehicleId: parsed.data.vehicleId,
        maintenanceType: parsed.data.maintenanceType,
        description: parsed.data.description,
        scheduledDate: parsed.data.scheduledDate,
        cost: parsed.data.cost?.toString(),
      })
      .returning();

    res.status(201).json({ data: row });
  });

  router.get("/vehicles/:id/health-score", async (req: AuthedRequest, res) => {
    const score = await predictLocal(req.params.id, req.fleetId!);
    res.json({ data: score });
  });

  router.get("/vehicles/:id/predictions", async (req: AuthedRequest, res) => {
    const mlUrl = process.env.MAINTENANCE_ML_URL ?? "http://localhost:5002";
    try {
      const upstream = await fetch(`${mlUrl}/predict/${req.params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fleetId: req.fleetId }),
      });
      if (upstream.ok) {
        return res.json(await upstream.json());
      }
    } catch {
      // local heuristic
    }

    const score = await predictLocal(req.params.id, req.fleetId!);
    if (score.riskScore > 70) {
      await createAlert(io, {
        fleetId: req.fleetId!,
        vehicleId: req.params.id,
        alertType: "MAINTENANCE_DUE",
        alertSeverity: "CRITICAL",
        alertMessage: `Urgent maintenance — risk ${score.riskScore}`,
      });
    }
    res.json({ data: score });
  });

  return router;
}

async function predictLocal(vehicleId: string, fleetId: string) {
  const [vehicle] = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.id, vehicleId), eq(vehicles.fleetId, fleetId)))
    .limit(1);

  const history = await db
    .select()
    .from(maintenanceRecords)
    .where(
      and(
        eq(maintenanceRecords.vehicleId, vehicleId),
        eq(maintenanceRecords.fleetId, fleetId),
      ),
    )
    .orderBy(desc(maintenanceRecords.createdAt))
    .limit(10);

  const ageFactor = vehicle?.year ? Math.max(0, 2026 - vehicle.year) * 3 : 20;
  const openJobs = history.filter((h) => !h.completedDate).length;
  const riskScore = Math.min(99, ageFactor + openJobs * 12 + 15);

  const days =
    riskScore > 75 ? 3 : riskScore > 50 ? 14 : 30;
  const predictedFailureDate = new Date();
  predictedFailureDate.setDate(predictedFailureDate.getDate() + days);

  const [saved] = await db
    .insert(maintenanceRecords)
    .values({
      fleetId,
      vehicleId,
      maintenanceType: "ENGINE_INSPECTION",
      description: "Auto prediction",
      riskScore: riskScore.toFixed(2),
      predictedFailureDate: predictedFailureDate.toISOString().slice(0, 10),
      scheduledDate: predictedFailureDate.toISOString().slice(0, 10),
    })
    .returning();

  return {
    vehicleId,
    riskScore,
    predictedFailureDate: predictedFailureDate.toISOString(),
    recommendedService:
      riskScore > 75
        ? "URGENT_INSPECTION"
        : riskScore > 50
          ? "SCHEDULED_SERVICE"
          : "ROUTINE_MAINTENANCE",
    confidence: 0.82,
    recordId: saved.id,
  };
}
