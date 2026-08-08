import type { SubscriptionTier } from "./types.js";

export const RATE_LIMITS: Record<SubscriptionTier, number> = {
  STARTER: 100,
  PRO: 1000,
  ENTERPRISE: 10000,
};

export function tierRateLimit(tier: SubscriptionTier): number {
  return RATE_LIMITS[tier] ?? RATE_LIMITS.STARTER;
}
