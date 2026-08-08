-- Extensions for SFMS (Timescale + PostGIS optional)
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Telemetry hypertable created after app migrations via migrate.ts
