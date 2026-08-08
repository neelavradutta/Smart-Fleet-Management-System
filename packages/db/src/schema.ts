import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  numeric,
  boolean,
  jsonb,
  date,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "STARTER",
  "PRO",
  "ENTERPRISE",
]);
export const vehicleTypeEnum = pgEnum("vehicle_type", [
  "VAN",
  "TRUCK",
  "BIKE",
  "CAR",
]);
export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "ACTIVE",
  "INACTIVE",
  "MAINTENANCE",
  "RETIRED",
]);
export const driverStatusEnum = pgEnum("driver_status", [
  "ACTIVE",
  "INACTIVE",
  "ON_LEAVE",
]);
export const userRoleEnum = pgEnum("user_role", [
  "OWNER",
  "DISPATCHER",
  "VIEWER",
]);
export const alertTypeEnum = pgEnum("alert_type", [
  "GEOFENCE_VIOLATION",
  "MAINTENANCE_DUE",
  "HARSH_DRIVING",
  "FUEL_ANOMALY",
  "DELAY",
  "BREAKDOWN",
]);
export const alertSeverityEnum = pgEnum("alert_severity", [
  "INFO",
  "WARNING",
  "CRITICAL",
]);
export const geofenceTypeEnum = pgEnum("geofence_type", [
  "DEPOT",
  "RESTRICTED",
  "CUSTOMER_ZONE",
  "PARKING",
]);

export const fleets = pgTable("fleets", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  industry: varchar("industry", { length: 60 }).notNull().default("LOGISTICS"),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .notNull()
    .default("STARTER"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 160 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    role: userRoleEnum("role").notNull().default("OWNER"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("users_email_uidx").on(t.email)],
);

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 80 }).notNull(),
    keyHash: text("key_hash").notNull(),
    keyPrefix: varchar("key_prefix", { length: 12 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("api_keys_fleet_idx").on(t.fleetId)],
);

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    vehicleNumber: varchar("vehicle_number", { length: 50 }).notNull(),
    vehicleType: vehicleTypeEnum("vehicle_type").notNull(),
    make: varchar("make", { length: 50 }),
    model: varchar("model", { length: 50 }),
    year: integer("year"),
    licensePlate: varchar("license_plate", { length: 20 }),
    vin: varchar("vin", { length: 17 }),
    capacityWeightKg: integer("capacity_weight_kg"),
    capacityVolumeM3: numeric("capacity_volume_m3", { precision: 8, scale: 2 }),
    status: vehicleStatusEnum("status").notNull().default("ACTIVE"),
    lastLocationUpdate: timestamp("last_location_update", { withTimezone: true }),
    currentLatitude: numeric("current_latitude", { precision: 9, scale: 6 }),
    currentLongitude: numeric("current_longitude", { precision: 9, scale: 6 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("vehicles_fleet_number_uidx").on(t.fleetId, t.vehicleNumber),
    index("vehicles_fleet_idx").on(t.fleetId),
  ],
);

export const drivers = pgTable(
  "drivers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    licenseNumber: varchar("license_number", { length: 50 }).notNull(),
    licenseExpiry: date("license_expiry"),
    status: driverStatusEnum("status").notNull().default("ACTIVE"),
    safetyScore: numeric("safety_score", { precision: 4, scale: 1 })
      .notNull()
      .default("100.0"),
    totalMiles: integer("total_miles").notNull().default(0),
    assignedVehicleId: uuid("assigned_vehicle_id").references(() => vehicles.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("drivers_fleet_email_uidx").on(t.fleetId, t.email),
    index("drivers_fleet_idx").on(t.fleetId),
  ],
);

export const fleetSettings = pgTable("fleet_settings", {
  fleetId: uuid("fleet_id")
    .primaryKey()
    .references(() => fleets.id, { onDelete: "cascade" }),
  maxVehicles: integer("max_vehicles").notNull().default(50),
  maxDrivers: integer("max_drivers").notNull().default(100),
  alertThresholds: jsonb("alert_thresholds")
    .$type<Record<string, number>>()
    .notNull()
    .default({ speeding_threshold: 80, harsh_accel_g: 0.4 }),
  geofenceNotification: boolean("geofence_notification").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const geofences = pgTable(
  "geofences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    geofenceType: geofenceTypeEnum("geofence_type").notNull().default("CUSTOMER_ZONE"),
    centerLatitude: numeric("center_latitude", { precision: 9, scale: 6 }),
    centerLongitude: numeric("center_longitude", { precision: 9, scale: 6 }),
    radiusMeters: integer("radius_meters"),
    polygonGeoJson: jsonb("polygon_geojson"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("geofences_fleet_idx").on(t.fleetId)],
);

export const alerts = pgTable(
  "alerts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    alertType: alertTypeEnum("alert_type").notNull(),
    alertSeverity: alertSeverityEnum("alert_severity").notNull().default("INFO"),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, {
      onDelete: "set null",
    }),
    driverId: uuid("driver_id").references(() => drivers.id, {
      onDelete: "set null",
    }),
    alertMessage: text("alert_message").notNull(),
    alertData: jsonb("alert_data").$type<Record<string, unknown>>(),
    isResolved: boolean("is_resolved").notNull().default(false),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("alerts_fleet_created_idx").on(t.fleetId, t.createdAt)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    actorUserId: uuid("actor_user_id"),
    action: varchar("action", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 60 }).notNull(),
    entityId: uuid("entity_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("audit_logs_fleet_idx").on(t.fleetId, t.createdAt)],
);
