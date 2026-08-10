import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { randomUUID } from "node:crypto";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ["http://localhost:3000", "http://127.0.0.1:3000"], credentials: true },
});

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
);
app.use(express.json());

const fleetId = "11111111-1111-1111-1111-111111111111";

const vehicles = [
  {
    id: "22222222-2222-2222-2222-222222222221",
    vehicleNumber: "TRK-001",
    licensePlate: "MH12AB1234",
    vehicleType: "TRUCK",
    make: "Tata",
    model: "Prima",
    variant: "4928.S",
    year: 2023,
    color: "Pearl White",
    fuelType: "DIESEL",
    transmission: "Manual 6-speed",
    engineNumber: "TATA-ENG-4928-001",
    chassisNumber: "MAT4123456TRK001A",
    vin: "MAT4123456TRK001A",
    capacityWeightKg: 16000,
    capacityVolumeM3: 42,
    status: "ACTIVE",
    currentDriverName: "Rajesh Kumar",
    checkInAt: new Date().toISOString().slice(0, 10) + "T06:42:00.000Z",
    checkOutAt: null,
    driverHistory: [
      {
        fullName: "Rajesh Kumar",
        checkInAt: new Date().toISOString().slice(0, 10) + "T06:42:00.000Z",
        checkOutAt: null,
        safetyScore: "94.5",
        totalMiles: 12450,
      },
      {
        fullName: "Vikram Patel",
        checkInAt: new Date(Date.now() - 86400000).toISOString().slice(0, 10) + "T08:10:00.000Z",
        checkOutAt: new Date(Date.now() - 86400000).toISOString().slice(0, 10) + "T18:35:00.000Z",
        safetyScore: "88.0",
        totalMiles: 15200,
      },
      {
        fullName: "Anita Shah",
        checkInAt: new Date(Date.now() - 172800000).toISOString().slice(0, 10) + "T07:05:00.000Z",
        checkOutAt: new Date(Date.now() - 172800000).toISOString().slice(0, 10) + "T17:20:00.000Z",
        safetyScore: "98.0",
        totalMiles: 9800,
      },
    ],
    currentLatitude: "19.076090",
    currentLongitude: "72.877426",
    lastLocationUpdate: new Date(Date.now() - 45000).toISOString(),
    registrationDate: "2023-03-14",
    registrationExpiry: "2028-03-13",
    registrationAuthority: "RTO Pune (MH12)",
    registrationStatus: "ACTIVE",
    insuranceProvider: "ICICI Lombard",
    policyNumber: "IL-MH-TRK001-2023",
    insuranceStartDate: "2025-03-14",
    insuranceExpiryDate: "2026-03-13",
    insuranceStatus: "ACTIVE",
    pucCertificateNumber: "PUC-PUN-88421",
    pucIssueDate: "2025-08-01",
    pucExpiryDate: "2026-01-31",
    fitnessCertificate: "FIT-MH12-99231 · Valid",
    permitStatus: "ACTIVE",
    permitExpiry: "2027-03-13",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    vehicleNumber: "VAN-014",
    licensePlate: "MH14CD5678",
    vehicleType: "VAN",
    make: "Mahindra",
    model: "Supro",
    variant: "Cargo VX",
    year: 2022,
    color: "Silver Mist",
    fuelType: "DIESEL",
    transmission: "Manual 5-speed",
    engineNumber: "MH-SUP-ENG-014",
    chassisNumber: "MA1VAN014XYZ98765",
    vin: "MA1VAN014XYZ98765",
    capacityWeightKg: 1200,
    capacityVolumeM3: 8.5,
    status: "ACTIVE",
    currentDriverName: "Anita Shah",
    checkInAt: new Date().toISOString().slice(0, 10) + "T07:15:00.000Z",
    checkOutAt: null,
    driverHistory: [
      {
        fullName: "Anita Shah",
        checkInAt: new Date().toISOString().slice(0, 10) + "T07:15:00.000Z",
        checkOutAt: null,
        safetyScore: "98.0",
        totalMiles: 9800,
      },
      {
        fullName: "Rajesh Kumar",
        checkInAt: new Date(Date.now() - 259200000).toISOString().slice(0, 10) + "T09:00:00.000Z",
        checkOutAt: new Date(Date.now() - 259200000).toISOString().slice(0, 10) + "T16:45:00.000Z",
        safetyScore: "94.5",
        totalMiles: 12450,
      },
    ],
    currentLatitude: "19.218330",
    currentLongitude: "72.978090",
    lastLocationUpdate: new Date(Date.now() - 120000).toISOString(),
    registrationDate: "2022-06-21",
    registrationExpiry: "2027-06-20",
    registrationAuthority: "RTO Thane (MH14)",
    registrationStatus: "ACTIVE",
    insuranceProvider: "Bajaj Allianz",
    policyNumber: "BA-VAN014-77821",
    insuranceStartDate: "2025-06-21",
    insuranceExpiryDate: "2026-06-20",
    insuranceStatus: "ACTIVE",
    pucCertificateNumber: "PUC-THN-55102",
    pucIssueDate: "2025-07-12",
    pucExpiryDate: "2026-01-11",
    fitnessCertificate: "FIT-MH14-44118 · Valid",
    permitStatus: "ACTIVE",
    permitExpiry: "2026-12-31",
  },
  {
    id: "22222222-2222-2222-2222-222222222223",
    vehicleNumber: "BIKE-07",
    licensePlate: "MH01EF9012",
    vehicleType: "BIKE",
    make: "Hero",
    model: "Splendor",
    variant: "Plus i3s",
    year: 2021,
    color: "Black with Green",
    fuelType: "PETROL",
    transmission: "4-speed",
    engineNumber: "HERO-SPL-ENG-07",
    chassisNumber: "MBLBIKE07SPLNDR21",
    vin: "MBLBIKE07SPLNDR21",
    capacityWeightKg: 150,
    capacityVolumeM3: 0.4,
    status: "MAINTENANCE",
    currentDriverName: null,
    checkInAt: null,
    checkOutAt: null,
    driverHistory: [
      {
        fullName: "Vikram Patel",
        checkInAt: new Date(Date.now() - 432000000).toISOString().slice(0, 10) + "T10:20:00.000Z",
        checkOutAt: new Date(Date.now() - 432000000).toISOString().slice(0, 10) + "T14:05:00.000Z",
        safetyScore: "88.0",
        totalMiles: 15200,
      },
    ],
    currentLatitude: "19.113640",
    currentLongitude: "72.869720",
    lastLocationUpdate: new Date(Date.now() - 86400000).toISOString(),
    registrationDate: "2021-09-05",
    registrationExpiry: "2026-09-04",
    registrationAuthority: "RTO Mumbai Central (MH01)",
    registrationStatus: "ACTIVE",
    insuranceProvider: "HDFC Ergo",
    policyNumber: "HE-BIKE07-33019",
    insuranceStartDate: "2025-09-05",
    insuranceExpiryDate: "2026-09-04",
    insuranceStatus: "ACTIVE",
    pucCertificateNumber: "PUC-MUM-22910",
    pucIssueDate: "2025-06-18",
    pucExpiryDate: "2025-12-17",
    fitnessCertificate: "N/A — two-wheeler",
    permitStatus: "N/A",
    permitExpiry: "—",
  },
  {
    id: "22222222-2222-2222-2222-222222222224",
    vehicleNumber: "TRK-009",
    licensePlate: "MH12GH3456",
    vehicleType: "TRUCK",
    make: "Ashok Leyland",
    model: "Boss",
    variant: "1215 Tipper",
    year: 2020,
    color: "Ash Grey",
    fuelType: "DIESEL",
    transmission: "Manual 6-speed",
    engineNumber: "AL-BOSS-ENG-009",
    chassisNumber: "MB1TRK009BOSS2020",
    vin: "MB1TRK009BOSS2020",
    capacityWeightKg: 14000,
    capacityVolumeM3: 38,
    status: "INACTIVE",
    currentDriverName: null,
    checkInAt: null,
    checkOutAt: null,
    driverHistory: [
      {
        fullName: "Rajesh Kumar",
        checkInAt: new Date(Date.now() - 1209600000).toISOString().slice(0, 10) + "T06:30:00.000Z",
        checkOutAt: new Date(Date.now() - 1209600000).toISOString().slice(0, 10) + "T19:10:00.000Z",
        safetyScore: "94.5",
        totalMiles: 12450,
      },
      {
        fullName: "Anita Shah",
        checkInAt: new Date(Date.now() - 1814400000).toISOString().slice(0, 10) + "T07:40:00.000Z",
        checkOutAt: new Date(Date.now() - 1814400000).toISOString().slice(0, 10) + "T15:55:00.000Z",
        safetyScore: "98.0",
        totalMiles: 9800,
      },
    ],
    currentLatitude: "19.033050",
    currentLongitude: "73.029660",
    lastLocationUpdate: new Date(Date.now() - 604800000).toISOString(),
    registrationDate: "2020-01-18",
    registrationExpiry: "2025-01-17",
    registrationAuthority: "RTO Pune (MH12)",
    registrationStatus: "INACTIVE",
    insuranceProvider: "New India Assurance",
    policyNumber: "NIA-TRK009-11002",
    insuranceStartDate: "2024-01-18",
    insuranceExpiryDate: "2025-01-17",
    insuranceStatus: "EXPIRED",
    pucCertificateNumber: "PUC-PUN-10088",
    pucIssueDate: "2024-11-02",
    pucExpiryDate: "2025-05-01",
    fitnessCertificate: "FIT-MH12-10009 · Expired",
    permitStatus: "INACTIVE",
    permitExpiry: "2025-01-17",
  },
];

const drivers = [
  {
    id: "33333333-3333-3333-3333-333333333331",
    fullName: "Rajesh Kumar",
    email: "rajesh@demo.fleet",
    phone: "+919800011111",
    licenseNumber: "MH1420110012345",
    status: "ACTIVE",
    safetyScore: "94.5",
    totalMiles: 12450,
  },
  {
    id: "33333333-3333-3333-3333-333333333332",
    fullName: "Anita Shah",
    email: "anita@demo.fleet",
    phone: "+919800022222",
    licenseNumber: "MH1420150098765",
    status: "ACTIVE",
    safetyScore: "98.0",
    totalMiles: 9800,
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    fullName: "Vikram Patel",
    email: "vikram@demo.fleet",
    phone: "+919800033333",
    licenseNumber: "MH1420180054321",
    status: "ON_LEAVE",
    safetyScore: "88.0",
    totalMiles: 15200,
  },
];

const alerts = [
  {
    id: randomUUID(),
    alertType: "GEOFENCE_VIOLATION",
    alertSeverity: "CRITICAL",
    alertMessage: "TRK-001 entered Restricted Zone — Andheri",
    isResolved: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: randomUUID(),
    alertType: "HARSH_DRIVING",
    alertSeverity: "WARNING",
    alertMessage: "Speeding 92 > 80 on VAN-014",
    isResolved: false,
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: randomUUID(),
    alertType: "MAINTENANCE_DUE",
    alertSeverity: "INFO",
    alertMessage: "BIKE-07 oil change due in 3 days",
    isResolved: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const geofences = [
  {
    id: randomUUID(),
    name: "Andheri Restricted",
    geofenceType: "RESTRICTED",
    centerLatitude: "19.1197",
    centerLongitude: "72.8468",
    radiusMeters: 800,
  },
  {
    id: randomUUID(),
    name: "BKC Depot",
    geofenceType: "DEPOT",
    centerLatitude: "19.0660",
    centerLongitude: "72.8697",
    radiusMeters: 400,
  },
];

const routes = [
  {
    id: randomUUID(),
    routeStatus: "ACTIVE",
    plannedDistanceKm: "56.20",
    co2Kg: "11.802",
    totalStops: 8,
    optimizationScore: "91.0",
  },
];

const shipments = [
  {
    id: randomUUID(),
    customerName: "Acme Retail",
    deliveryAddress: "Bandra West Hub",
    shipmentStatus: "IN_TRANSIT",
    trackingToken: "demotrackacme001",
    expectedDeliveryTime: new Date(Date.now() + 7200000).toISOString(),
  },
  {
    id: randomUUID(),
    customerName: "FreshMart",
    deliveryAddress: "Powai Lake View",
    shipmentStatus: "ASSIGNED",
    trackingToken: "demotrackfresh002",
    expectedDeliveryTime: new Date(Date.now() + 14400000).toISOString(),
  },
];

const documents = [
  {
    id: randomUUID(),
    title: "Rajesh — Driving License",
    docType: "LICENSE",
    expiresAt: "2026-09-15",
    fileUrl: "https://example.com/docs/license-rajesh.pdf",
  },
  {
    id: randomUUID(),
    title: "TRK-001 — Insurance",
    docType: "INSURANCE",
    expiresAt: "2026-12-01",
    fileUrl: "https://example.com/docs/ins-trk001.pdf",
  },
  {
    id: randomUUID(),
    title: "TRK-001 — Fitness Certificate",
    docType: "PERMIT",
    expiresAt: "2027-03-20",
    fileUrl: "https://example.com/docs/fit-trk001.pdf",
  },
  {
    id: randomUUID(),
    title: "VAN-014 — Insurance",
    docType: "INSURANCE",
    expiresAt: "2026-08-30",
    fileUrl: "https://example.com/docs/ins-van014.pdf",
  },
  {
    id: randomUUID(),
    title: "BIKE-07 — RC Book",
    docType: "RC",
    expiresAt: "2028-01-10",
    fileUrl: "https://example.com/docs/rc-bike07.pdf",
  },
  {
    id: randomUUID(),
    title: "TRK-009 — Insurance (expired hold)",
    docType: "INSURANCE",
    expiresAt: "2026-02-01",
    fileUrl: "https://example.com/docs/ins-trk009.pdf",
  },
];

app.get("/health", (_req, res) => res.json({ ok: true, mode: "demo" }));

app.post("/api/v1/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};
  if (email === "owner@demo.fleet" && password === "demo12345") {
    return res.json({
      token: "demo-token",
      user: {
        id: "u1",
        email,
        fullName: "Demo Owner",
        role: "OWNER",
        fleetId,
        fleetName: "Demo Logistics",
        tier: "PRO",
      },
    });
  }
  res.status(401).json({ error: "Invalid email or password" });
});

// Public tracking — BEFORE auth middleware
app.get("/api/v1/track/:token", (req, res) => {
  const s = shipments.find((x) => x.trackingToken === req.params.token);
  if (!s) return res.status(404).json({ error: "Tracking not found" });
  res.json({
    data: {
      shipmentStatus: s.shipmentStatus,
      customerName: s.customerName,
      deliveryAddress: s.deliveryAddress,
      expectedDeliveryTime: s.expectedDeliveryTime ?? null,
      actualDeliveryTime: s.actualDeliveryTime ?? null,
    },
  });
});

function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  if (h === "Bearer demo-token" || req.headers["x-api-key"] === "demo-key") {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized — login again" });
}

app.use("/api/v1", requireAuth);

app.get("/api/v1/fleets/me", (_req, res) => {
  res.json({
    data: {
      id: fleetId,
      name: "Demo Logistics",
      subscriptionTier: "PRO",
      settings: { maxVehicles: 100, maxDrivers: 200 },
    },
  });
});

function seedSeries(base, n = 12, jitter = 3) {
  const out = [];
  let v = base;
  for (let i = n - 1; i >= 0; i--) {
    v = Math.max(0, v + (Math.random() - 0.45) * jitter);
    const t = new Date(Date.now() - i * 5000);
    out.push({
      t: t.toISOString(),
      label: t.toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
      value: Number(v.toFixed(1)),
    });
  }
  return out;
}

const analyticsLive = {
  onTimeDeliveryRate: 92,
  totalDistanceKm: 1280,
  totalCo2Kg: 268.8,
  avgCostPerKm: 18.5,
  avgUtilization: 78,
  avgSafetyScore:
    drivers.reduce((s, d) => s + Number(d.safetyScore), 0) / drivers.length,
  esgScore: 79,
  carbonOffsetsKg: 27,
  greenRouteHint: "Prefer shorter optimized routes to cut CO2 10-15%",
  series: {
    onTime: seedSeries(92, 16, 2.2),
    distance: seedSeries(12, 16, 1.4),
    cost: seedSeries(18.5, 16, 0.6),
    co2: seedSeries(4.2, 16, 0.5),
  },
};

function analyticsSnapshot() {
  return {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter((v) => v.status === "ACTIVE").length,
    totalDrivers: drivers.length,
    avgSafetyScore: Number(analyticsLive.avgSafetyScore.toFixed(1)),
    onTimeDeliveryRate: Number(analyticsLive.onTimeDeliveryRate.toFixed(1)),
    totalDistanceKm: Number(analyticsLive.totalDistanceKm.toFixed(1)),
    totalCo2Kg: Number(analyticsLive.totalCo2Kg.toFixed(1)),
    avgUtilization: Number(analyticsLive.avgUtilization.toFixed(1)),
    avgCostPerKm: Number(analyticsLive.avgCostPerKm.toFixed(2)),
    esgScore: Number(analyticsLive.esgScore.toFixed(1)),
    carbonOffsetsKg: Number(analyticsLive.carbonOffsetsKg.toFixed(1)),
    greenRouteHint: analyticsLive.greenRouteHint,
    series: analyticsLive.series,
    updatedAt: new Date().toISOString(),
  };
}

app.get("/api/v1/analytics/fleet-overview", (_req, res) => {
  const s = analyticsSnapshot();
  res.json({
    data: {
      totalVehicles: s.totalVehicles,
      activeVehicles: s.activeVehicles,
      totalDrivers: s.totalDrivers,
      avgSafetyScore: s.avgSafetyScore,
      onTimeDeliveryRate: s.onTimeDeliveryRate,
      totalDistanceKm: s.totalDistanceKm,
      totalCo2Kg: s.totalCo2Kg,
      avgUtilization: s.avgUtilization,
      avgCostPerKm: s.avgCostPerKm,
      series: s.series,
      updatedAt: s.updatedAt,
    },
  });
});

app.get("/api/v1/analytics/esg", (_req, res) => {
  const s = analyticsSnapshot();
  res.json({
    data: {
      totalDistanceKm: s.totalDistanceKm,
      totalCo2Kg: s.totalCo2Kg,
      esgScore: s.esgScore,
      greenRouteHint: s.greenRouteHint,
      carbonOffsetsKg: s.carbonOffsetsKg,
      updatedAt: s.updatedAt,
    },
  });
});

app.get("/api/v1/analytics/live", (_req, res) => {
  res.json({ data: analyticsSnapshot() });
});

app.get("/api/v1/vehicles", (_req, res) => res.json({ data: vehicles }));
app.post("/api/v1/vehicles", (req, res) => {
  const b = req.body ?? {};
  const row = {
    id: randomUUID(),
    vehicleNumber: b.vehicleNumber ?? `NEW-${vehicles.length + 1}`,
    licensePlate: b.licensePlate ?? null,
    vehicleType: b.vehicleType ?? "TRUCK",
    make: b.make ?? null,
    model: b.model ?? null,
    variant: b.variant ?? null,
    year: b.year ?? null,
    color: b.color ?? null,
    fuelType: b.fuelType ?? null,
    transmission: b.transmission ?? null,
    engineNumber: b.engineNumber ?? null,
    chassisNumber: b.chassisNumber ?? null,
    vin: b.vin ?? b.chassisNumber ?? null,
    capacityWeightKg: b.capacityWeightKg ?? null,
    capacityVolumeM3: b.capacityVolumeM3 ?? null,
    status: b.status ?? "ACTIVE",
    currentDriverName: b.currentDriverName ?? null,
    checkInAt: b.checkInAt ?? null,
    checkOutAt: b.checkOutAt ?? null,
    driverHistory: Array.isArray(b.driverHistory) ? b.driverHistory : [],
    currentLatitude: String(b.currentLatitude ?? "19.076090"),
    currentLongitude: String(b.currentLongitude ?? "72.877426"),
    lastLocationUpdate: b.lastLocationUpdate ?? new Date().toISOString(),
    registrationDate: b.registrationDate ?? null,
    registrationExpiry: b.registrationExpiry ?? null,
    registrationAuthority: b.registrationAuthority ?? null,
    registrationStatus: b.registrationStatus ?? "ACTIVE",
    insuranceProvider: b.insuranceProvider ?? null,
    policyNumber: b.policyNumber ?? null,
    insuranceStartDate: b.insuranceStartDate ?? null,
    insuranceExpiryDate: b.insuranceExpiryDate ?? null,
    insuranceStatus: b.insuranceStatus ?? "ACTIVE",
    pucCertificateNumber: b.pucCertificateNumber ?? null,
    pucIssueDate: b.pucIssueDate ?? null,
    pucExpiryDate: b.pucExpiryDate ?? null,
    fitnessCertificate: b.fitnessCertificate ?? null,
    permitStatus: b.permitStatus ?? null,
    permitExpiry: b.permitExpiry ?? null,
  };
  vehicles.unshift(row);
  res.status(201).json({ data: row });
});
app.get("/api/v1/drivers", (_req, res) => res.json({ data: drivers }));
app.get("/api/v1/alerts", (_req, res) => res.json({ data: alerts }));
app.get("/api/v1/geofences", (_req, res) => res.json({ data: geofences }));
app.get("/api/v1/routes", (_req, res) => res.json({ data: routes }));
app.get("/api/v1/shipments", (_req, res) => res.json({ data: shipments }));
app.get("/api/v1/documents", (_req, res) => res.json({ data: documents }));
app.get("/api/v1/documents/expiring", (_req, res) => {
  res.json({
    data: documents.filter((d) => d.expiresAt && d.expiresAt <= "2026-10-01"),
  });
});

app.post("/api/v1/geofences", (req, res) => {
  const row = {
    id: randomUUID(),
    name: req.body.name ?? "New zone",
    geofenceType: req.body.geofenceType ?? "CUSTOMER_ZONE",
    centerLatitude: String(req.body.centerLatitude ?? 19.076),
    centerLongitude: String(req.body.centerLongitude ?? 72.877),
    radiusMeters: req.body.radiusMeters ?? 500,
  };
  geofences.unshift(row);
  res.status(201).json({ data: row });
});

app.post("/api/v1/shipments", (req, res) => {
  const trackingToken = randomUUID().replace(/-/g, "").slice(0, 16);
  const row = {
    id: randomUUID(),
    customerName: req.body.customerName ?? "Customer",
    deliveryAddress: req.body.deliveryAddress ?? "Delivery address",
    shipmentStatus: "CREATED",
    trackingToken,
    expectedDeliveryTime: new Date(Date.now() + 86400000).toISOString(),
  };
  shipments.unshift(row);
  res.status(201).json({ data: row });
});

app.patch("/api/v1/shipments/:id/status", (req, res) => {
  const s = shipments.find((x) => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  s.shipmentStatus = req.body.status ?? s.shipmentStatus;
  if (s.shipmentStatus === "DELIVERED") {
    s.actualDeliveryTime = new Date().toISOString();
  }
  io.emit("shipment_update", s);
  res.json({ data: s });
});

app.post("/api/v1/shipments/:id/proof-of-delivery", (req, res) => {
  const s = shipments.find((x) => x.id === req.params.id);
  if (!s) return res.status(404).json({ error: "Not found" });
  s.shipmentStatus = "DELIVERED";
  s.actualDeliveryTime = new Date().toISOString();
  s.podNotes = req.body.notes ?? "";
  res.json({ data: s });
});

app.post("/api/v1/routes/optimize", (req, res) => {
  const stops = req.body.deliveryLocations?.length ?? 3;
  const row = {
    id: randomUUID(),
    routeStatus: "PLANNED",
    plannedDistanceKm: (28 + stops * 4.5).toFixed(2),
    co2Kg: ((28 + stops * 4.5) * 0.21).toFixed(3),
    totalStops: stops,
    optimizationScore: "88.0",
  };
  routes.unshift(row);
  res.status(202).json({
    status: "completed",
    jobId: randomUUID(),
    routes: [row],
  });
});

app.patch("/api/v1/alerts/:id/resolve", (req, res) => {
  const a = alerts.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ error: "Not found" });
  a.isResolved = true;
  res.json({ data: a });
});

app.post("/api/v1/telemetry/gps", (req, res) => {
  const v = vehicles.find((x) => x.id === req.body.vehicleId);
  if (v) {
    v.currentLatitude = String(req.body.latitude);
    v.currentLongitude = String(req.body.longitude);
  }
  const payload = {
    vehicleId: req.body.vehicleId,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    speed: req.body.speed ?? 0,
    heading: req.body.heading ?? 0,
    timestamp: new Date().toISOString(),
  };
  io.to(`fleet:${fleetId}:tracking`).emit("location_update", payload);
  io.emit("location_update", payload);

  if ((req.body.speed ?? 0) > 80) {
    const alert = {
      id: randomUUID(),
      alertType: "HARSH_DRIVING",
      alertSeverity: "WARNING",
      alertMessage: `Speeding ${Math.round(req.body.speed)} km/h`,
      isResolved: false,
      createdAt: new Date().toISOString(),
    };
    alerts.unshift(alert);
    io.emit("alert", alert);
  }
  res.json({ success: true });
});

io.on("connection", (socket) => {
  const fid = socket.handshake.auth?.fleetId || fleetId;
  socket.join(`fleet:${fid}:tracking`);
});

function pushSeries(key, value) {
  const now = new Date();
  analyticsLive.series[key].push({
    t: now.toISOString(),
    label: now.toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
    value: Number(value.toFixed(1)),
  });
  if (analyticsLive.series[key].length > 24) {
    analyticsLive.series[key].shift();
  }
}

/** Simulate live GPS so map feels alive */
setInterval(() => {
  for (const v of vehicles.filter((x) => x.status === "ACTIVE")) {
    const lat = Number(v.currentLatitude) + (Math.random() - 0.5) * 0.004;
    const lng = Number(v.currentLongitude) + (Math.random() - 0.5) * 0.004;
    v.currentLatitude = lat.toFixed(6);
    v.currentLongitude = lng.toFixed(6);
    const payload = {
      vehicleId: v.id,
      latitude: lat,
      longitude: lng,
      speed: 20 + Math.random() * 45,
      heading: Math.random() * 360,
      timestamp: new Date().toISOString(),
    };
    io.emit("location_update", payload);
  }
}, 3500);

/** Live analytics drift + broadcast */
setInterval(() => {
  const tickDistance = 0.8 + Math.random() * 2.4;
  analyticsLive.totalDistanceKm += tickDistance;
  analyticsLive.totalCo2Kg += tickDistance * 0.21;
  analyticsLive.onTimeDeliveryRate = Math.min(
    99.5,
    Math.max(84, analyticsLive.onTimeDeliveryRate + (Math.random() - 0.48) * 1.4),
  );
  analyticsLive.avgCostPerKm = Math.min(
    26,
    Math.max(14, analyticsLive.avgCostPerKm + (Math.random() - 0.5) * 0.35),
  );
  analyticsLive.avgUtilization = Math.min(
    96,
    Math.max(55, analyticsLive.avgUtilization + (Math.random() - 0.5) * 1.8),
  );
  analyticsLive.avgSafetyScore = Math.min(
    99,
    Math.max(80, analyticsLive.avgSafetyScore + (Math.random() - 0.5) * 0.4),
  );
  analyticsLive.esgScore = Math.min(
    95,
    Math.max(60, analyticsLive.esgScore + (Math.random() - 0.45) * 0.5),
  );
  analyticsLive.carbonOffsetsKg += Math.random() * 0.15;

  pushSeries("onTime", analyticsLive.onTimeDeliveryRate);
  pushSeries("distance", tickDistance * 4);
  pushSeries("cost", analyticsLive.avgCostPerKm);
  pushSeries("co2", tickDistance * 0.21 * 8);

  io.emit("analytics_update", analyticsSnapshot());
}, 3000);

const PORT = Number(process.env.PORT || 3001);
httpServer.listen(PORT, () => {
  console.log(`Demo API on http://localhost:${PORT}`);
  console.log("Login: owner@demo.fleet / demo12345");
});
