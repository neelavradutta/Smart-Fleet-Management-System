import type { SubscriptionTier } from "./types.js";

const FEATURES = {
  live_map: ["STARTER", "PRO", "ENTERPRISE"],
  geofences: ["STARTER", "PRO", "ENTERPRISE"],
  route_optimize: ["PRO", "ENTERPRISE"],
  predictive_maintenance: ["PRO", "ENTERPRISE"],
  dynamic_pricing: ["ENTERPRISE"],
  esg_reports: ["PRO", "ENTERPRISE"],
  webhooks: ["PRO", "ENTERPRISE"],
  custom_reports: ["PRO", "ENTERPRISE"],
  edge_sync: ["ENTERPRISE"],
} as const;

export type FeatureFlag = keyof typeof FEATURES;

export function hasFeature(tier: SubscriptionTier, feature: FeatureFlag): boolean {
  return (FEATURES[feature] as readonly string[]).includes(tier);
}

export function listFeatures(tier: SubscriptionTier): FeatureFlag[] {
  return (Object.keys(FEATURES) as FeatureFlag[]).filter((f) =>
    hasFeature(tier, f),
  );
}
