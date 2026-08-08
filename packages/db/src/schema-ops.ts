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
} from "drizzle-orm/pg-core";
import { drivers, fleets, vehicles } from "./schema.js";

export const routeStatusEnum = pgEnum("route_status", [
  "PLANNED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);
export const routeTypeEnum = pgEnum("route_type", [
  "DELIVERY",
  "COLLECTION",
  "SERVICE",
  "SWEEP",
]);
export const shipmentStatusEnum = pgEnum("shipment_status", [
  "CREATED",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
]);
export const maintenanceTypeEnum = pgEnum("maintenance_type", [
  "OIL_CHANGE",
  "TIRE_ROTATION",
  "BRAKE_SERVICE",
  "ENGINE_INSPECTION",
  "OTHER",
]);
export const docEntityEnum = pgEnum("doc_entity_type", [
  "VEHICLE",
  "DRIVER",
  "FLEET",
]);
export const docTypeEnum = pgEnum("doc_type", [
  "LICENSE",
  "INSURANCE",
  "RC",
  "PERMIT",
  "OTHER",
]);

export const routes = pgTable(
  "routes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, {
      onDelete: "set null",
    }),
    driverId: uuid("driver_id").references(() => drivers.id, {
      onDelete: "set null",
    }),
    routeStatus: routeStatusEnum("route_status").notNull().default("PLANNED"),
    routeType: routeTypeEnum("route_type").notNull().default("DELIVERY"),
    plannedDistanceKm: numeric("planned_distance_km", { precision: 8, scale: 2 }),
    actualDistanceKm: numeric("actual_distance_km", { precision: 8, scale: 2 }),
    plannedDurationMinutes: integer("planned_duration_minutes"),
    actualDurationMinutes: integer("actual_duration_minutes"),
    plannedStartTime: timestamp("planned_start_time", { withTimezone: true }),
    actualStartTime: timestamp("actual_start_time", { withTimezone: true }),
    plannedEndTime: timestamp("planned_end_time", { withTimezone: true }),
    actualEndTime: timestamp("actual_end_time", { withTimezone: true }),
    totalStops: integer("total_stops").notNull().default(0),
    completedStops: integer("completed_stops").notNull().default(0),
    optimizationScore: numeric("optimization_score", { precision: 4, scale: 1 }),
    efficiencyScore: numeric("efficiency_score", { precision: 4, scale: 1 }),
    co2Kg: numeric("co2_kg", { precision: 10, scale: 3 }),
    routeJson: jsonb("route_json").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("routes_fleet_idx").on(t.fleetId)],
);

export const shipments = pgTable(
  "shipments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    routeId: uuid("route_id").references(() => routes.id, { onDelete: "set null" }),
    shipmentStatus: shipmentStatusEnum("shipment_status")
      .notNull()
      .default("CREATED"),
    customerId: varchar("customer_id", { length: 100 }),
    customerName: varchar("customer_name", { length: 100 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 20 }),
    customerEmail: varchar("customer_email", { length: 100 }),
    pickupAddress: text("pickup_address").notNull(),
    deliveryAddress: text("delivery_address").notNull(),
    pickupLat: numeric("pickup_lat", { precision: 9, scale: 6 }),
    pickupLng: numeric("pickup_lng", { precision: 9, scale: 6 }),
    deliveryLat: numeric("delivery_lat", { precision: 9, scale: 6 }),
    deliveryLng: numeric("delivery_lng", { precision: 9, scale: 6 }),
    weightKg: numeric("weight_kg", { precision: 8, scale: 2 }),
    volumeM3: numeric("volume_m3", { precision: 8, scale: 2 }),
    expectedDeliveryTime: timestamp("expected_delivery_time", {
      withTimezone: true,
    }),
    actualDeliveryTime: timestamp("actual_delivery_time", { withTimezone: true }),
    trackingToken: varchar("tracking_token", { length: 64 }).notNull(),
    podSignatureUrl: text("pod_signature_url"),
    podPhotoUrls: jsonb("pod_photo_urls").$type<string[]>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("shipments_fleet_idx").on(t.fleetId),
    index("shipments_tracking_idx").on(t.trackingToken),
  ],
);

export const maintenanceRecords = pgTable(
  "maintenance_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    maintenanceType: maintenanceTypeEnum("maintenance_type").notNull(),
    description: text("description"),
    scheduledDate: date("scheduled_date"),
    completedDate: date("completed_date"),
    cost: numeric("cost", { precision: 10, scale: 2 }),
    riskScore: numeric("risk_score", { precision: 5, scale: 2 }),
    predictedFailureDate: date("predicted_failure_date"),
    partsReplaced: jsonb("parts_replaced").$type<string[]>().default([]),
    mechanicName: varchar("mechanic_name", { length: 100 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("maintenance_fleet_idx").on(t.fleetId)],
);

export const driverBehaviorEvents = pgTable(
  "driver_behavior_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    driverId: uuid("driver_id")
      .notNull()
      .references(() => drivers.id, { onDelete: "cascade" }),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, {
      onDelete: "set null",
    }),
    eventType: varchar("event_type", { length: 40 }).notNull(),
    severity: varchar("severity", { length: 20 }).notNull().default("WARNING"),
    latitude: numeric("latitude", { precision: 9, scale: 6 }),
    longitude: numeric("longitude", { precision: 9, scale: 6 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("behavior_fleet_idx").on(t.fleetId, t.createdAt)],
);

export const fuelReadings = pgTable(
  "fuel_readings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    fuelLevel: numeric("fuel_level", { precision: 5, scale: 2 }).notNull(),
    odometerKm: numeric("odometer_km", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("fuel_vehicle_idx").on(t.vehicleId, t.createdAt)],
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    entityType: docEntityEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    docType: docTypeEnum("doc_type").notNull(),
    title: varchar("title", { length: 120 }).notNull(),
    fileUrl: text("file_url").notNull(),
    expiresAt: date("expires_at"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("documents_fleet_idx").on(t.fleetId)],
);

export const webhooks = pgTable(
  "webhooks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    event: varchar("event", { length: 80 }).notNull(),
    url: text("url").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("webhooks_fleet_idx").on(t.fleetId)],
);

export const webhookOutbox = pgTable(
  "webhook_outbox",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    event: varchar("event", { length: 80 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    delivered: boolean("delivered").notNull().default(false),
    attempts: integer("attempts").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("outbox_pending_idx").on(t.delivered, t.createdAt)],
);

export const usageMeters = pgTable(
  "usage_meters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    metric: varchar("metric", { length: 60 }).notNull(),
    quantity: numeric("quantity", { precision: 14, scale: 4 }).notNull().default("0"),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("usage_fleet_idx").on(t.fleetId, t.metric)],
);

export const pricingSuggestions = pgTable(
  "pricing_suggestions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fleetId: uuid("fleet_id")
      .notNull()
      .references(() => fleets.id, { onDelete: "cascade" }),
    zone: varchar("zone", { length: 80 }).notNull(),
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    surgeMultiplier: numeric("surge_multiplier", { precision: 4, scale: 2 })
      .notNull()
      .default("1.0"),
    demandScore: numeric("demand_score", { precision: 5, scale: 2 }).notNull(),
    validUntil: timestamp("valid_until", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("pricing_fleet_idx").on(t.fleetId)],
);
