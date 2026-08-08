CREATE TYPE "public"."route_status" AS ENUM('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "public"."route_type" AS ENUM('DELIVERY', 'COLLECTION', 'SERVICE', 'SWEEP');
CREATE TYPE "public"."shipment_status" AS ENUM('CREATED', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED');
CREATE TYPE "public"."maintenance_type" AS ENUM('OIL_CHANGE', 'TIRE_ROTATION', 'BRAKE_SERVICE', 'ENGINE_INSPECTION', 'OTHER');
CREATE TYPE "public"."doc_entity_type" AS ENUM('VEHICLE', 'DRIVER', 'FLEET');
CREATE TYPE "public"."doc_type" AS ENUM('LICENSE', 'INSURANCE', 'RC', 'PERMIT', 'OTHER');

CREATE TABLE "routes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL REFERENCES "fleets"("id") ON DELETE cascade,
  "vehicle_id" uuid REFERENCES "vehicles"("id") ON DELETE set null,
  "driver_id" uuid REFERENCES "drivers"("id") ON DELETE set null,
  "route_status" "route_status" DEFAULT 'PLANNED' NOT NULL,
  "route_type" "route_type" DEFAULT 'DELIVERY' NOT NULL,
  "planned_distance_km" numeric(8, 2),
  "actual_distance_km" numeric(8, 2),
  "planned_duration_minutes" integer,
  "actual_duration_minutes" integer,
  "planned_start_time" timestamp with time zone,
  "actual_start_time" timestamp with time zone,
  "planned_end_time" timestamp with time zone,
  "actual_end_time" timestamp with time zone,
  "total_stops" integer DEFAULT 0 NOT NULL,
  "completed_stops" integer DEFAULT 0 NOT NULL,
  "optimization_score" numeric(4, 1),
  "efficiency_score" numeric(4, 1),
  "co2_kg" numeric(10, 3),
  "route_json" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "shipments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL REFERENCES "fleets"("id") ON DELETE cascade,
  "route_id" uuid REFERENCES "routes"("id") ON DELETE set null,
  "shipment_status" "shipment_status" DEFAULT 'CREATED' NOT NULL,
  "customer_id" varchar(100),
  "customer_name" varchar(100) NOT NULL,
  "customer_phone" varchar(20),
  "customer_email" varchar(100),
  "pickup_address" text NOT NULL,
  "delivery_address" text NOT NULL,
  "pickup_lat" numeric(9, 6),
  "pickup_lng" numeric(9, 6),
  "delivery_lat" numeric(9, 6),
  "delivery_lng" numeric(9, 6),
  "weight_kg" numeric(8, 2),
  "volume_m3" numeric(8, 2),
  "expected_delivery_time" timestamp with time zone,
  "actual_delivery_time" timestamp with time zone,
  "tracking_token" varchar(64) NOT NULL,
  "pod_signature_url" text,
  "pod_photo_urls" jsonb DEFAULT '[]'::jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "maintenance_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL REFERENCES "fleets"("id") ON DELETE cascade,
  "vehicle_id" uuid NOT NULL REFERENCES "vehicles"("id") ON DELETE cascade,
  "maintenance_type" "maintenance_type" NOT NULL,
  "description" text,
  "scheduled_date" date,
  "completed_date" date,
  "cost" numeric(10, 2),
  "risk_score" numeric(5, 2),
  "predicted_failure_date" date,
  "parts_replaced" jsonb DEFAULT '[]'::jsonb,
  "mechanic_name" varchar(100),
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "driver_behavior_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL REFERENCES "fleets"("id") ON DELETE cascade,
  "driver_id" uuid NOT NULL REFERENCES "drivers"("id") ON DELETE cascade,
  "vehicle_id" uuid REFERENCES "vehicles"("id") ON DELETE set null,
  "event_type" varchar(40) NOT NULL,
  "severity" varchar(20) DEFAULT 'WARNING' NOT NULL,
  "latitude" numeric(9, 6),
  "longitude" numeric(9, 6),
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "fuel_readings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL REFERENCES "fleets"("id") ON DELETE cascade,
  "vehicle_id" uuid NOT NULL REFERENCES "vehicles"("id") ON DELETE cascade,
  "fuel_level" numeric(5, 2) NOT NULL,
  "odometer_km" numeric(12, 2),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL REFERENCES "fleets"("id") ON DELETE cascade,
  "entity_type" "doc_entity_type" NOT NULL,
  "entity_id" uuid NOT NULL,
  "doc_type" "doc_type" NOT NULL,
  "title" varchar(120) NOT NULL,
  "file_url" text NOT NULL,
  "expires_at" date,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "webhooks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL REFERENCES "fleets"("id") ON DELETE cascade,
  "event" varchar(80) NOT NULL,
  "url" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "webhook_outbox" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL REFERENCES "fleets"("id") ON DELETE cascade,
  "event" varchar(80) NOT NULL,
  "payload" jsonb NOT NULL,
  "delivered" boolean DEFAULT false NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "usage_meters" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL REFERENCES "fleets"("id") ON DELETE cascade,
  "metric" varchar(60) NOT NULL,
  "quantity" numeric(14, 4) DEFAULT '0' NOT NULL,
  "period_start" date NOT NULL,
  "period_end" date NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "pricing_suggestions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL REFERENCES "fleets"("id") ON DELETE cascade,
  "zone" varchar(80) NOT NULL,
  "base_price" numeric(10, 2) NOT NULL,
  "surge_multiplier" numeric(4, 2) DEFAULT '1.0' NOT NULL,
  "demand_score" numeric(5, 2) NOT NULL,
  "valid_until" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "routes_fleet_idx" ON "routes" ("fleet_id");
CREATE INDEX "shipments_fleet_idx" ON "shipments" ("fleet_id");
CREATE INDEX "shipments_tracking_idx" ON "shipments" ("tracking_token");
CREATE INDEX "maintenance_fleet_idx" ON "maintenance_records" ("fleet_id");
CREATE INDEX "behavior_fleet_idx" ON "driver_behavior_events" ("fleet_id","created_at");
CREATE INDEX "fuel_vehicle_idx" ON "fuel_readings" ("vehicle_id","created_at");
CREATE INDEX "documents_fleet_idx" ON "documents" ("fleet_id");
CREATE INDEX "webhooks_fleet_idx" ON "webhooks" ("fleet_id");
CREATE INDEX "outbox_pending_idx" ON "webhook_outbox" ("delivered","created_at");
CREATE INDEX "usage_fleet_idx" ON "usage_meters" ("fleet_id","metric");
CREATE INDEX "pricing_fleet_idx" ON "pricing_suggestions" ("fleet_id");
