import type { NextFunction, Request, Response } from "express";
import { createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import { and, eq } from "drizzle-orm";
import { apiKeys, fleets, setTenant } from "@sfms/db";
import type { JwtPayload, SubscriptionTier } from "@sfms/shared";
import { db } from "../lib/db.js";
import { env } from "../env.js";

export type AuthedRequest = Request & {
  fleetId?: string;
  tenantTier?: SubscriptionTier;
  userId?: string;
  authMode?: "jwt" | "apiKey";
};

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const apiKey = req.header("x-api-key");
    if (apiKey) {
      const keyHash = createHash("sha256").update(apiKey).digest("hex");
      const rows = await db
        .select({
          id: apiKeys.id,
          fleetId: apiKeys.fleetId,
          tier: fleets.subscriptionTier,
        })
        .from(apiKeys)
        .innerJoin(fleets, eq(fleets.id, apiKeys.fleetId))
        .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)))
        .limit(1);

      if (!rows[0]) {
        return res.status(401).json({ error: "Invalid API key" });
      }

      req.fleetId = rows[0].fleetId;
      req.tenantTier = rows[0].tier;
      req.authMode = "apiKey";
      await setTenant(db, rows[0].fleetId);
      return next();
    }

    const header = req.header("authorization");
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing credentials" });
    }

    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;

    const [fleet] = await db
      .select({ id: fleets.id, tier: fleets.subscriptionTier })
      .from(fleets)
      .where(eq(fleets.id, payload.fleetId))
      .limit(1);

    if (!fleet) {
      return res.status(401).json({ error: "Unknown fleet" });
    }

    req.fleetId = payload.fleetId;
    req.userId = payload.userId;
    req.tenantTier = fleet.tier;
    req.authMode = "jwt";
    await setTenant(db, payload.fleetId);
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
