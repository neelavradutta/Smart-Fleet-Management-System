import { Router } from "express";
import { eq } from "drizzle-orm";
import { fleetSettings, fleets } from "@sfms/db";
import { db } from "../lib/db.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const fleetsRouter = Router();

fleetsRouter.get("/me", async (req: AuthedRequest, res) => {
  const [fleet] = await db
    .select()
    .from(fleets)
    .where(eq(fleets.id, req.fleetId!))
    .limit(1);

  if (!fleet) return res.status(404).json({ error: "Fleet not found" });

  const [settings] = await db
    .select()
    .from(fleetSettings)
    .where(eq(fleetSettings.fleetId, req.fleetId!))
    .limit(1);

  res.json({ data: { ...fleet, settings: settings ?? null } });
});
