import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { createDb } from "./client.js";
import { setTenant } from "./tenant.js";
import {
  apiKeys,
  drivers,
  fleetSettings,
  fleets,
  users,
  vehicles,
} from "./schema.js";

const url = process.env.DATABASE_URL ?? "postgresql://sfms:sfms@localhost:5432/sfms";

async function main() {
  const db = createDb(url);

  const existing = await db.select().from(fleets).limit(1);
  if (existing.length > 0) {
    console.log("Seed skipped — fleet already exists");
    process.exit(0);
  }

  const [fleet] = await db
    .insert(fleets)
    .values({
      name: "Demo Logistics",
      industry: "ECOMMERCE",
      subscriptionTier: "PRO",
    })
    .returning();

  await setTenant(db, fleet.id);

  const passwordHash = await bcrypt.hash("demo12345", 10);
  const [owner] = await db
    .insert(users)
    .values({
      fleetId: fleet.id,
      email: "owner@demo.fleet",
      passwordHash,
      fullName: "Demo Owner",
      role: "OWNER",
    })
    .returning();

  await db.insert(fleetSettings).values({
    fleetId: fleet.id,
    maxVehicles: 100,
    maxDrivers: 200,
  });

  const rawKey = `sfms_${randomBytes(24).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  await db.insert(apiKeys).values({
    fleetId: fleet.id,
    name: "device-ingest",
    keyHash,
    keyPrefix: rawKey.slice(0, 12),
  });

  const [v1, v2] = await db
    .insert(vehicles)
    .values([
      {
        fleetId: fleet.id,
        vehicleNumber: "TRK-001",
        vehicleType: "TRUCK",
        make: "Tata",
        model: "Prima",
        year: 2023,
        licensePlate: "MH12AB1234",
        status: "ACTIVE",
        currentLatitude: "19.076090",
        currentLongitude: "72.877426",
      },
      {
        fleetId: fleet.id,
        vehicleNumber: "VAN-014",
        vehicleType: "VAN",
        make: "Mahindra",
        model: "Supro",
        year: 2022,
        licensePlate: "MH14CD5678",
        status: "ACTIVE",
        currentLatitude: "19.218330",
        currentLongitude: "72.978090",
      },
      {
        fleetId: fleet.id,
        vehicleNumber: "BIKE-07",
        vehicleType: "BIKE",
        make: "Hero",
        model: "Splendor",
        year: 2021,
        licensePlate: "MH01EF9012",
        status: "MAINTENANCE",
        currentLatitude: "19.113640",
        currentLongitude: "72.869720",
      },
      {
        fleetId: fleet.id,
        vehicleNumber: "TRK-009",
        vehicleType: "TRUCK",
        make: "Ashok Leyland",
        model: "Boss",
        year: 2020,
        licensePlate: "MH12GH3456",
        status: "INACTIVE",
        currentLatitude: "19.033050",
        currentLongitude: "73.029660",
      },
    ])
    .returning();

  await db.insert(drivers).values([
    {
      fleetId: fleet.id,
      email: "rajesh@demo.fleet",
      fullName: "Rajesh Kumar",
      phone: "+919800011111",
      licenseNumber: "MH1420110012345",
      status: "ACTIVE",
      assignedVehicleId: v1.id,
      safetyScore: "94.5",
    },
    {
      fleetId: fleet.id,
      email: "anita@demo.fleet",
      fullName: "Anita Shah",
      phone: "+919800022222",
      licenseNumber: "MH1420150098765",
      status: "ACTIVE",
      assignedVehicleId: v2.id,
      safetyScore: "98.0",
    },
  ]);

  // touch update so drizzle types stay happy if unused
  await db.select().from(fleets).where(eq(fleets.id, fleet.id));

  console.log("Seed complete");
  console.log({
    loginEmail: owner.email,
    loginPassword: "demo12345",
    fleetId: fleet.id,
    deviceApiKey: rawKey,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
