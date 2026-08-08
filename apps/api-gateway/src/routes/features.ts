import { Router } from "express";
import { listFeatures } from "@sfms/shared";
import type { AuthedRequest } from "../middleware/auth.js";

export const featuresRouter = Router();

featuresRouter.get("/", async (req: AuthedRequest, res) => {
  res.json({
    data: {
      tier: req.tenantTier ?? "STARTER",
      features: listFeatures(req.tenantTier ?? "STARTER"),
    },
  });
});
