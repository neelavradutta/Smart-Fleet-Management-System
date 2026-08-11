import { z } from "zod";

export const vehicleTypeSchema = z.enum(["VAN", "TRUCK", "BIKE", "CAR"]);
export const vehicleStatusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "MAINTENANCE",
  "RETIRED",
]);
export const driverStatusSchema = z.enum([
  "ON_DUTY",
  "OFF_DUTY",
  "ON_LEAVE",
  "OFFBOARDED",
]);
export const geofenceTypeSchema = z.enum([
  "DEPOT",
  "RESTRICTED",
  "CUSTOMER_ZONE",
  "PARKING",
]);
export const routeStatusSchema = z.enum([
  "PLANNED",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED",
]);
export const shipmentStatusSchema = z.enum([
  "CREATED",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "FAILED",
]);

export const createFleetSchema = z.object({
  name: z.string().min(2).max(120),
  industry: z.string().min(2).max(60).default("LOGISTICS"),
  subscriptionTier: z
    .enum(["STARTER", "PRO", "ENTERPRISE"])
    .default("STARTER"),
});

export const createVehicleSchema = z.object({
  vehicleNumber: z.string().min(1).max(50),
  vehicleType: vehicleTypeSchema,
  make: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
  year: z.number().int().min(1980).max(2100).optional(),
  licensePlate: z.string().max(20).optional(),
  vin: z.string().length(17).optional(),
  capacityWeightKg: z.number().int().positive().optional(),
  capacityVolumeM3: z.number().positive().optional(),
  status: vehicleStatusSchema.default("ACTIVE"),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const createDriverSchema = z.object({
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  fullName: z.string().min(2).max(120),
  licenseNumber: z.string().min(3).max(50),
  licenseExpiry: z.string().date().optional(),
  status: driverStatusSchema.default("ON_DUTY"),
  assignedVehicleId: z.string().uuid().optional().nullable(),
});

export const updateDriverSchema = createDriverSchema.partial();

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const gpsTelemetrySchema = z.object({
  vehicleId: z.string().uuid(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  altitude: z.number().optional(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  accuracy: z.number().min(0).optional(),
  timestamp: z.string().datetime().optional(),
});

export const fuelTelemetrySchema = z.object({
  vehicleId: z.string().uuid(),
  fuelLevel: z.number().min(0).max(100),
  odometerKm: z.number().min(0).optional(),
  timestamp: z.string().datetime().optional(),
});

export const obdTelemetrySchema = z.object({
  vehicleId: z.string().uuid(),
  engineRpm: z.number().int().min(0).optional(),
  engineTemp: z.number().optional(),
  batteryVoltage: z.number().optional(),
  faultCode: z.string().max(10).optional(),
  faultDescription: z.string().max(500).optional(),
  timestamp: z.string().datetime().optional(),
});

export const createGeofenceSchema = z.object({
  name: z.string().min(1).max(100),
  geofenceType: geofenceTypeSchema.default("CUSTOMER_ZONE"),
  centerLatitude: z.number().min(-90).max(90),
  centerLongitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().positive().max(100000),
  isActive: z.boolean().default(true),
});

export const createRouteSchema = z.object({
  vehicleId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  routeType: z.enum(["DELIVERY", "COLLECTION", "SERVICE", "SWEEP"]).default("DELIVERY"),
  plannedStartTime: z.string().datetime().optional(),
  plannedEndTime: z.string().datetime().optional(),
  stops: z
    .array(
      z.object({
        id: z.string(),
        lat: z.number(),
        lng: z.number(),
        label: z.string().optional(),
      }),
    )
    .default([]),
});

export const optimizeRouteSchema = z.object({
  vehicleIds: z.array(z.string().uuid()).min(1),
  depotLat: z.number(),
  depotLng: z.number(),
  deliveryLocations: z.array(
    z.object({
      id: z.string(),
      lat: z.number(),
      lng: z.number(),
      timeWindow: z.tuple([z.number(), z.number()]).optional(),
      demand: z.number().default(1),
    }),
  ),
  constraints: z
    .object({
      maxDistanceKm: z.number().default(500),
      maxDurationMinutes: z.number().default(600),
    })
    .default({}),
});

export const createShipmentSchema = z.object({
  routeId: z.string().uuid().optional().nullable(),
  customerName: z.string().min(1).max(100),
  customerPhone: z.string().max(20).optional(),
  customerEmail: z.string().email().optional(),
  pickupAddress: z.string().min(1),
  deliveryAddress: z.string().min(1),
  pickupLat: z.number().optional(),
  pickupLng: z.number().optional(),
  deliveryLat: z.number().optional(),
  deliveryLng: z.number().optional(),
  weightKg: z.number().positive().optional(),
  volumeM3: z.number().positive().optional(),
  expectedDeliveryTime: z.string().datetime().optional(),
});

export const updateShipmentStatusSchema = z.object({
  status: shipmentStatusSchema,
});

export const proofOfDeliverySchema = z.object({
  signatureUrl: z.string().url().optional(),
  photoUrls: z.array(z.string().url()).default([]),
  notes: z.string().max(1000).optional(),
});

export const behaviorEventSchema = z.object({
  driverId: z.string().uuid(),
  vehicleId: z.string().uuid().optional(),
  eventType: z.enum([
    "SPEEDING",
    "HARSH_ACCELERATION",
    "HARSH_BRAKING",
    "HARSH_TURN",
  ]),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]).default("WARNING"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const scheduleMaintenanceSchema = z.object({
  vehicleId: z.string().uuid(),
  maintenanceType: z.enum([
    "OIL_CHANGE",
    "TIRE_ROTATION",
    "BRAKE_SERVICE",
    "ENGINE_INSPECTION",
    "OTHER",
  ]),
  description: z.string().max(500).optional(),
  scheduledDate: z.string().date(),
  cost: z.number().nonnegative().optional(),
});

export const createDocumentSchema = z.object({
  entityType: z.enum(["VEHICLE", "DRIVER", "FLEET"]),
  entityId: z.string().uuid(),
  docType: z.enum(["LICENSE", "INSURANCE", "RC", "PERMIT", "OTHER"]),
  title: z.string().min(1).max(120),
  fileUrl: z.string().url(),
  expiresAt: z.string().date().optional(),
});

export const createWebhookSchema = z.object({
  event: z.string().min(1).max(80),
  url: z.string().url(),
  isActive: z.boolean().default(true),
});

export const customReportSchema = z.object({
  metrics: z.array(z.string()).default(["distance", "on_time_rate", "fuel"]),
  groupBy: z.enum(["day", "week", "month", "vehicle"]).default("day"),
  format: z.enum(["json", "csv"]).default("json"),
  days: z.number().int().min(1).max(365).default(30),
});

export type CreateFleetInput = z.infer<typeof createFleetSchema>;
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GpsTelemetryInput = z.infer<typeof gpsTelemetrySchema>;
