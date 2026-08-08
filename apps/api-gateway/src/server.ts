import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { Server as SocketIOServer } from "socket.io";
import { tierRateLimit } from "@sfms/shared";
import { env } from "./env.js";
import { redis } from "./lib/redis.js";
import { requireAuth, type AuthedRequest } from "./middleware/auth.js";
import { authRouter } from "./routes/auth.js";
import { vehiclesRouter } from "./routes/vehicles.js";
import { driversRouter } from "./routes/drivers.js";
import { fleetsRouter } from "./routes/fleets.js";
import { createTelemetryRouter } from "./routes/telemetry.js";
import { geofencesRouter } from "./routes/geofences.js";
import { alertsRouter } from "./routes/alerts.js";
import { routesRouter } from "./routes/routes.js";
import { publicTrackingRouter, shipmentsRouter } from "./routes/shipments.js";
import { createFuelRouter } from "./routes/fuel.js";
import { createMaintenanceRouter } from "./routes/maintenance.js";
import { createBehaviorRouter } from "./routes/behavior.js";
import { analyticsRouter } from "./routes/analytics.js";
import { documentsRouter } from "./routes/documents.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { pricingRouter } from "./routes/pricing.js";
import { billingRouter } from "./routes/billing.js";
import { featuresRouter } from "./routes/features.js";
import { gdprRouter } from "./routes/gdpr.js";

const app = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: { origin: env.corsOrigin, credentials: true },
});

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api-gateway", version: "0.2.0" });
});

app.get("/ready", async (_req, res) => {
  try {
    await redis.ping();
    res.json({ ok: true, redis: true });
  } catch {
    res.status(503).json({ ok: false, redis: false });
  }
});

app.get("/metrics", (_req, res) => {
  res.type("text/plain").send(
    [
      "# HELP sfms_up SFMS gateway up",
      "# TYPE sfms_up gauge",
      "sfms_up 1",
      `# HELP websocket_active_connections Active WS`,
      `# TYPE websocket_active_connections gauge`,
      `websocket_active_connections ${io.engine.clientsCount}`,
    ].join("\n"),
  );
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/track", publicTrackingRouter);

const limiter = rateLimit({
  windowMs: 60_000,
  max: (req) => {
    const tier = (req as AuthedRequest).tenantTier ?? "STARTER";
    return tierRateLimit(tier);
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req as AuthedRequest).fleetId ?? "anon",
  validate: { xForwardedForHeader: false },
});

app.use("/api/", requireAuth, limiter);
app.use("/api/v1/fleets", fleetsRouter);
app.use("/api/v1/vehicles", vehiclesRouter);
app.use("/api/v1/drivers", driversRouter);
app.use("/api/v1/telemetry", createTelemetryRouter(io));
app.use("/api/v1/geofences", geofencesRouter);
app.use("/api/v1/alerts", alertsRouter);
app.use("/api/v1/routes", routesRouter);
app.use("/api/v1/shipments", shipmentsRouter);
app.use("/api/v1/fuel", createFuelRouter(io));
app.use("/api/v1/maintenance", createMaintenanceRouter(io));
app.use("/api/v1/drivers-behavior", createBehaviorRouter(io));
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/documents", documentsRouter);
app.use("/api/v1/webhooks", webhooksRouter);
app.use("/api/v1/pricing", pricingRouter);
app.use("/api/v1/billing", billingRouter);
app.use("/api/v1/features", featuresRouter);
app.use("/api/v1/gdpr", gdprRouter);

io.on("connection", (socket) => {
  const fleetId = socket.handshake.auth?.fleetId as string | undefined;
  if (fleetId) {
    socket.join(`fleet:${fleetId}:tracking`);
  }

  socket.on("subscribe_vehicle", (vehicleId: string) => {
    socket.join(`vehicle:${vehicleId}:tracking`);
  });

  socket.on("unsubscribe_vehicle", (vehicleId: string) => {
    socket.leave(`vehicle:${vehicleId}:tracking`);
  });
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
  },
);

httpServer.listen(env.port, async () => {
  try {
    await redis.connect();
  } catch {
    console.warn("Redis not connected — cache/telemetry batch degraded");
  }
  console.log(`API Gateway on :${env.port}`);
});
