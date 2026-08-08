import { Router } from "express";
import { and, eq, sql } from "drizzle-orm";
import { usageMeters } from "@sfms/db";
import { db } from "../lib/db.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const billingRouter = Router();

function period() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

billingRouter.get("/usage", async (req: AuthedRequest, res) => {
  const rows = await db
    .select()
    .from(usageMeters)
    .where(eq(usageMeters.fleetId, req.fleetId!));
  res.json({ data: rows, stripeHook: "metered billing ready" });
});

billingRouter.post("/usage/:metric", async (req: AuthedRequest, res) => {
  const metric = req.params.metric;
  const qty = Number(req.body?.quantity ?? 1);
  const { start, end } = period();

  const [existing] = await db
    .select()
    .from(usageMeters)
    .where(
      and(
        eq(usageMeters.fleetId, req.fleetId!),
        eq(usageMeters.metric, metric),
        eq(usageMeters.periodStart, start),
      ),
    )
    .limit(1);

  if (existing) {
    const [row] = await db
      .update(usageMeters)
      .set({
        quantity: sql`${usageMeters.quantity}::numeric + ${qty}`,
      })
      .where(eq(usageMeters.id, existing.id))
      .returning();
    return res.json({ data: row });
  }

  const [row] = await db
    .insert(usageMeters)
    .values({
      fleetId: req.fleetId!,
      metric,
      quantity: qty.toString(),
      periodStart: start,
      periodEnd: end,
    })
    .returning();

  res.status(201).json({ data: row });
});
