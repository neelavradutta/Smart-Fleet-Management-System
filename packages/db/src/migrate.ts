import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { sql } from "drizzle-orm";

const url = process.env.DATABASE_URL ?? "postgresql://sfms:sfms@localhost:5432/sfms";

async function main() {
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS timescaledb`);
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

  await migrate(db, { migrationsFolder: "./drizzle" });

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS vehicle_telemetry (
      time TIMESTAMPTZ NOT NULL,
      vehicle_id UUID NOT NULL,
      fleet_id UUID NOT NULL,
      latitude DECIMAL(9, 6),
      longitude DECIMAL(9, 6),
      altitude DECIMAL(8, 2),
      speed DECIMAL(5, 2),
      heading DECIMAL(5, 2),
      accuracy DECIMAL(5, 2),
      engine_rpm INT,
      engine_temp DECIMAL(5, 2),
      fuel_level DECIMAL(5, 2),
      battery_voltage DECIMAL(4, 2),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await db.execute(sql`
    SELECT create_hypertable('vehicle_telemetry', 'time', if_not_exists => TRUE)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS vehicle_telemetry_vehicle_time_idx
    ON vehicle_telemetry (vehicle_id, time DESC)
  `);

  await db.execute(sql`
    SELECT add_compression_policy('vehicle_telemetry', INTERVAL '7 days', if_not_exists => TRUE)
  `).catch(() => undefined);

  await db.execute(sql`
    CREATE MATERIALIZED VIEW IF NOT EXISTS vehicle_hourly_metrics AS
    SELECT
      time_bucket('1 hour', time) as bucket,
      vehicle_id,
      fleet_id,
      AVG(speed) as avg_speed,
      MAX(speed) as max_speed,
      COUNT(*) as record_count
    FROM vehicle_telemetry
    GROUP BY bucket, vehicle_id, fleet_id
  `).catch(() => undefined);

  await enableRls(db);

  console.log("Migrations complete");
  await client.end();
}

async function enableRls(db: ReturnType<typeof drizzle>) {
  const tables = [
    "vehicles",
    "drivers",
    "geofences",
    "alerts",
    "fleet_settings",
    "audit_logs",
    "api_keys",
    "users",
    "routes",
    "shipments",
    "maintenance_records",
    "driver_behavior_events",
    "fuel_readings",
    "documents",
    "webhooks",
    "webhook_outbox",
    "usage_meters",
    "pricing_suggestions",
  ];

  for (const table of tables) {
    await db.execute(sql.raw(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`));
    await db.execute(sql.raw(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`));
    await db.execute(sql.raw(`DROP POLICY IF EXISTS ${table}_tenant_isolation ON ${table}`));
    await db.execute(sql.raw(`
      CREATE POLICY ${table}_tenant_isolation ON ${table}
      USING (fleet_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid)
      WITH CHECK (fleet_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid)
    `));
  }

  // Login + API-key lookup run before tenant context is known
  await db.execute(sql.raw(`DROP POLICY IF EXISTS users_login_lookup ON users`));
  await db.execute(sql.raw(`
    CREATE POLICY users_login_lookup ON users
    FOR SELECT
    USING (true)
  `));
  await db.execute(sql.raw(`DROP POLICY IF EXISTS api_keys_lookup ON api_keys`));
  await db.execute(sql.raw(`
    CREATE POLICY api_keys_lookup ON api_keys
    FOR SELECT
    USING (true)
  `));

  await db.execute(sql.raw(`DROP POLICY IF EXISTS shipments_public_token ON shipments`));
  await db.execute(sql.raw(`
    CREATE POLICY shipments_public_token ON shipments
    FOR SELECT
    USING (
      tracking_token = NULLIF(current_setting('app.tracking_token', true), '')
      OR fleet_id = NULLIF(current_setting('app.current_tenant', true), '')::uuid
    )
  `));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
