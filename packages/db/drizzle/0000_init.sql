CREATE TYPE "public"."subscription_tier" AS ENUM('STARTER', 'PRO', 'ENTERPRISE');
CREATE TYPE "public"."vehicle_type" AS ENUM('VAN', 'TRUCK', 'BIKE', 'CAR');
CREATE TYPE "public"."vehicle_status" AS ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED');
CREATE TYPE "public"."driver_status" AS ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE');
CREATE TYPE "public"."user_role" AS ENUM('OWNER', 'DISPATCHER', 'VIEWER');
CREATE TYPE "public"."alert_type" AS ENUM('GEOFENCE_VIOLATION', 'MAINTENANCE_DUE', 'HARSH_DRIVING', 'FUEL_ANOMALY', 'DELAY', 'BREAKDOWN');
CREATE TYPE "public"."alert_severity" AS ENUM('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE "public"."geofence_type" AS ENUM('DEPOT', 'RESTRICTED', 'CUSTOMER_ZONE', 'PARKING');

CREATE TABLE "fleets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" varchar(120) NOT NULL,
  "industry" varchar(60) DEFAULT 'LOGISTICS' NOT NULL,
  "subscription_tier" "subscription_tier" DEFAULT 'STARTER' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL,
  "email" varchar(160) NOT NULL,
  "password_hash" text NOT NULL,
  "full_name" varchar(120) NOT NULL,
  "role" "user_role" DEFAULT 'OWNER' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "api_keys" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL,
  "name" varchar(80) NOT NULL,
  "key_hash" text NOT NULL,
  "key_prefix" varchar(12) NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "vehicles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL,
  "vehicle_number" varchar(50) NOT NULL,
  "vehicle_type" "vehicle_type" NOT NULL,
  "make" varchar(50),
  "model" varchar(50),
  "year" integer,
  "license_plate" varchar(20),
  "vin" varchar(17),
  "capacity_weight_kg" integer,
  "capacity_volume_m3" numeric(8, 2),
  "status" "vehicle_status" DEFAULT 'ACTIVE' NOT NULL,
  "last_location_update" timestamp with time zone,
  "current_latitude" numeric(9, 6),
  "current_longitude" numeric(9, 6),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "drivers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL,
  "email" varchar(160) NOT NULL,
  "phone" varchar(20),
  "full_name" varchar(120) NOT NULL,
  "license_number" varchar(50) NOT NULL,
  "license_expiry" date,
  "status" "driver_status" DEFAULT 'ACTIVE' NOT NULL,
  "safety_score" numeric(4, 1) DEFAULT '100.0' NOT NULL,
  "total_miles" integer DEFAULT 0 NOT NULL,
  "assigned_vehicle_id" uuid,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "fleet_settings" (
  "fleet_id" uuid PRIMARY KEY NOT NULL,
  "max_vehicles" integer DEFAULT 50 NOT NULL,
  "max_drivers" integer DEFAULT 100 NOT NULL,
  "alert_thresholds" jsonb DEFAULT '{"speeding_threshold":80,"harsh_accel_g":0.4}'::jsonb NOT NULL,
  "geofence_notification" boolean DEFAULT true NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "geofences" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL,
  "name" varchar(100) NOT NULL,
  "geofence_type" "geofence_type" DEFAULT 'CUSTOMER_ZONE' NOT NULL,
  "center_latitude" numeric(9, 6),
  "center_longitude" numeric(9, 6),
  "radius_meters" integer,
  "polygon_geojson" jsonb,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "alerts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL,
  "alert_type" "alert_type" NOT NULL,
  "alert_severity" "alert_severity" DEFAULT 'INFO' NOT NULL,
  "vehicle_id" uuid,
  "driver_id" uuid,
  "alert_message" text NOT NULL,
  "alert_data" jsonb,
  "is_resolved" boolean DEFAULT false NOT NULL,
  "resolved_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "fleet_id" uuid NOT NULL,
  "actor_user_id" uuid,
  "action" varchar(80) NOT NULL,
  "entity_type" varchar(60) NOT NULL,
  "entity_id" uuid,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "users" ADD CONSTRAINT "users_fleet_id_fleets_id_fk" FOREIGN KEY ("fleet_id") REFERENCES "public"."fleets"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_fleet_id_fleets_id_fk" FOREIGN KEY ("fleet_id") REFERENCES "public"."fleets"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_fleet_id_fleets_id_fk" FOREIGN KEY ("fleet_id") REFERENCES "public"."fleets"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_fleet_id_fleets_id_fk" FOREIGN KEY ("fleet_id") REFERENCES "public"."fleets"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "drivers" ADD CONSTRAINT "drivers_assigned_vehicle_id_vehicles_id_fk" FOREIGN KEY ("assigned_vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "fleet_settings" ADD CONSTRAINT "fleet_settings_fleet_id_fleets_id_fk" FOREIGN KEY ("fleet_id") REFERENCES "public"."fleets"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "geofences" ADD CONSTRAINT "geofences_fleet_id_fleets_id_fk" FOREIGN KEY ("fleet_id") REFERENCES "public"."fleets"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_fleet_id_fleets_id_fk" FOREIGN KEY ("fleet_id") REFERENCES "public"."fleets"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_fleet_id_fleets_id_fk" FOREIGN KEY ("fleet_id") REFERENCES "public"."fleets"("id") ON DELETE cascade ON UPDATE no action;

CREATE UNIQUE INDEX "users_email_uidx" ON "users" USING btree ("email");
CREATE INDEX "api_keys_fleet_idx" ON "api_keys" USING btree ("fleet_id");
CREATE UNIQUE INDEX "vehicles_fleet_number_uidx" ON "vehicles" USING btree ("fleet_id","vehicle_number");
CREATE INDEX "vehicles_fleet_idx" ON "vehicles" USING btree ("fleet_id");
CREATE UNIQUE INDEX "drivers_fleet_email_uidx" ON "drivers" USING btree ("fleet_id","email");
CREATE INDEX "drivers_fleet_idx" ON "drivers" USING btree ("fleet_id");
CREATE INDEX "geofences_fleet_idx" ON "geofences" USING btree ("fleet_id");
CREATE INDEX "alerts_fleet_created_idx" ON "alerts" USING btree ("fleet_id","created_at");
CREATE INDEX "audit_logs_fleet_idx" ON "audit_logs" USING btree ("fleet_id","created_at");
