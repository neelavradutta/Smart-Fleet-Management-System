export type SubscriptionTier = "STARTER" | "PRO" | "ENTERPRISE";

export type VehicleType = "VAN" | "TRUCK" | "BIKE" | "CAR";
export type VehicleStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "RETIRED";
export type DriverStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE";

export type AlertType =
  | "GEOFENCE_VIOLATION"
  | "MAINTENANCE_DUE"
  | "HARSH_DRIVING"
  | "FUEL_ANOMALY"
  | "DELAY"
  | "BREAKDOWN";

export type AlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface JwtPayload {
  fleetId: string;
  userId: string;
  email: string;
  role: "OWNER" | "DISPATCHER" | "VIEWER";
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface TenantContext {
  fleetId: string;
  tier: SubscriptionTier;
  userId?: string;
  apiKeyId?: string;
}
