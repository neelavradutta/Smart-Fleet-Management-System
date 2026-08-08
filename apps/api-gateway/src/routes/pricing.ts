import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { pricingSuggestions, vehicles } from "@sfms/db";
import { hasFeature } from "@sfms/shared";
import { db } from "../lib/db.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const pricingRouter = Router();

pricingRouter.get("/suggestions", async (req: AuthedRequest, res) => {
  if (!hasFeature(req.tenantTier ?? "STARTER", "dynamic_pricing")) {
    return res.status(403).json({ error: "Feature requires ENTERPRISE tier" });
  }

  const rows = await db
    .select()
    .from(pricingSuggestions)
    .where(eq(pricingSuggestions.fleetId, req.fleetId!))
    .orderBy(desc(pricingSuggestions.createdAt))
    .limit(20);

  res.json({ data: rows });
});

pricingRouter.post("/recompute", async (req: AuthedRequest, res) => {
  if (!hasFeature(req.tenantTier ?? "STARTER", "dynamic_pricing")) {
    return res.status(403).json({ error: "Feature requires ENTERPRISE tier" });
  }

  const [v] = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.fleetId, req.fleetId!));

  const activeHint = v ? 1 : 0;
  const demandScore = 40 + activeHint * 20 + Math.random() * 30;
  const surge = demandScore > 70 ? 1.4 : demandScore > 50 ? 1.15 : 1.0;
  const validUntil = new Date(Date.now() + 6 * 3600_000);

  const zones = ["NORTH", "SOUTH", "CENTRAL"];
  const created = [];
  for (const zone of zones) {
    const [row] = await db
      .insert(pricingSuggestions)
      .values({
        fleetId: req.fleetId!,
        zone,
        basePrice: (120 + Math.random() * 40).toFixed(2),
        surgeMultiplier: surge.toFixed(2),
        demandScore: demandScore.toFixed(2),
        validUntil,
      })
      .returning();
    created.push(row);
  }

  res.status(201).json({ data: created });
});
