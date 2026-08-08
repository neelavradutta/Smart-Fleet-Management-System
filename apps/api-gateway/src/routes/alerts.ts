import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { alerts } from "@sfms/db";
import { db } from "../lib/db.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const alertsRouter = Router();

alertsRouter.get("/", async (req: AuthedRequest, res) => {
  const rows = await db
    .select()
    .from(alerts)
    .where(eq(alerts.fleetId, req.fleetId!))
    .orderBy(desc(alerts.createdAt))
    .limit(100);
  res.json({ data: rows });
});

alertsRouter.patch("/:id/resolve", async (req: AuthedRequest, res) => {
  const [row] = await db
    .update(alerts)
    .set({ isResolved: true, resolvedAt: new Date() })
    .where(and(eq(alerts.id, req.params.id), eq(alerts.fleetId, req.fleetId!)))
    .returning();
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json({ data: row });
});
