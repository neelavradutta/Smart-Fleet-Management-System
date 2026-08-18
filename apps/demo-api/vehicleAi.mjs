/** Vehicle live metrics + Gen AI scorer. Fill missing keys only — never clobber 0. */

export const LIVE_KEYS = [
  "healthScore",
  "fuelLevel",
  "odometerKm",
  "totalTrips",
  "totalSpend",
  "fuelSpend",
  "maintenanceSpend",
  "challanSpend",
];

export const STATUS_KEYS = [
  "insuranceStatus",
  "registrationStatus",
  "permitStatus",
];

export const ALLOWED_PATCH_KEYS = [...LIVE_KEYS, ...STATUS_KEYS];

export function missingMetric(value) {
  return value === undefined || value === null || value === "";
}

function seedCode(vehicleNumber) {
  return String(vehicleNumber ?? "")
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
}

export function defaultLiveFields(v, index = 0) {
  const seed = seedCode(v.vehicleNumber);
  const fuelSpend = 85000 + (seed % 55) * 2400;
  const maintenanceSpend = 22000 + (seed % 40) * 1800;
  const challanSpend = (seed % 9) * 1500;
  return {
    healthScore: index === 3 ? 28 : 78 + ((index * 7) % 20),
    fuelLevel: 40 + ((index * 13) % 55),
    odometerKm: 18000 + (seed % 22000),
    totalTrips: 86 + (seed % 240),
    fuelSpend,
    maintenanceSpend,
    challanSpend,
    totalSpend: fuelSpend + maintenanceSpend + challanSpend,
  };
}

export function fillVehicleLive(v, index = 0) {
  const defaults = defaultLiveFields(v, index);
  for (const [key, val] of Object.entries(defaults)) {
    if (missingMetric(v[key])) v[key] = val;
  }
  return v;
}

export function pickAllowed(patch = {}) {
  const out = {};
  for (const key of ALLOWED_PATCH_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(patch, key)) continue;
    const value = patch[key];
    if (value === undefined) continue;
    out[key] = value;
  }
  if (
    out.totalSpend === undefined &&
    (out.fuelSpend !== undefined ||
      out.maintenanceSpend !== undefined ||
      out.challanSpend !== undefined)
  ) {
    /* caller merges onto current before summing */
  }
  return out;
}

function dateExpired(iso) {
  if (!iso || iso === "—") return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function snapshot(v, ctx = {}) {
  return {
    id: v.id,
    vehicleNumber: v.vehicleNumber,
    status: v.status,
    healthScore: v.healthScore,
    fuelLevel: v.fuelLevel,
    odometerKm: v.odometerKm,
    totalTrips: v.totalTrips,
    totalSpend: v.totalSpend,
    fuelSpend: v.fuelSpend,
    maintenanceSpend: v.maintenanceSpend,
    challanSpend: v.challanSpend,
    speed: ctx.speed ?? v.lastGpsSpeed ?? 0,
    insuranceExpiryDate: v.insuranceExpiryDate,
    insuranceStatus: v.insuranceStatus,
    pucExpiryDate: v.pucExpiryDate,
    registrationExpiry: v.registrationExpiry,
    registrationStatus: v.registrationStatus,
    permitExpiry: v.permitExpiry,
    permitStatus: v.permitStatus,
  };
}

/** Internal tools — not a UI. */
export function makeVehicleTools(vehicles, applyPatch) {
  return {
    get_vehicle(id) {
      return vehicles.find((x) => x.id === id) ?? null;
    },
    list_vehicles() {
      return vehicles.map((v) => snapshot(v));
    },
    patch_vehicle(id, patch, source = "software") {
      return applyPatch(id, pickAllowed(patch), source);
    },
  };
}

export function heuristicPatch(v, ctx = {}) {
  const speed = Number(ctx.speed ?? v.lastGpsSpeed ?? 0);
  const dtSec = Number(ctx.dtSec ?? 3.5);
  const fuel = Number(v.fuelLevel ?? 50);
  let health = Number(v.healthScore ?? 80);
  const patch = {};

  if (fuel < 20) health -= 2;
  else if (fuel < 35) health -= 1;
  if (speed > 55) health -= 1;
  if (v.status === "MAINTENANCE") health -= 1;
  if (dateExpired(v.insuranceExpiryDate)) {
    patch.insuranceStatus = "EXPIRED";
    health -= 3;
  }
  if (dateExpired(v.pucExpiryDate)) health -= 1;
  if (dateExpired(v.permitExpiry)) {
    patch.permitStatus = "EXPIRED";
    health -= 1;
  }
  if (dateExpired(v.registrationExpiry)) {
    patch.registrationStatus = "EXPIRED";
    health -= 2;
  }
  if (Math.random() > 0.72) health += 1;
  patch.healthScore = Math.round(clamp(health, 0, 100));

  if (!ctx.skipOdometer) {
    const kmDelta = v.status === "ACTIVE" ? (speed * dtSec) / 3600 : 0;
    patch.odometerKm = Math.round((Number(v.odometerKm ?? 0) + kmDelta) * 10) / 10;
  }

  if (v.status === "ACTIVE" && Math.random() < 0.06) {
    patch.totalTrips = Number(v.totalTrips ?? 0) + 1;
  }

  const fuelDelta =
    v.status === "ACTIVE" ? -(0.15 + Math.random() * 0.45) : 0.05;
  let nextFuel = clamp(fuel + fuelDelta, 0, 100);
  if (nextFuel < 8 && Math.random() < 0.45) nextFuel = 42 + Math.random() * 38;
  patch.fuelLevel = Math.round(nextFuel * 10) / 10;

  if (v.status === "ACTIVE") {
    patch.fuelSpend = Math.round(Number(v.fuelSpend ?? 0) + 35 + Math.random() * 90);
    if (Math.random() < 0.04) {
      patch.maintenanceSpend = Math.round(
        Number(v.maintenanceSpend ?? 0) + 200 + Math.random() * 800,
      );
    }
    if (Math.random() < 0.015) {
      patch.challanSpend = Number(v.challanSpend ?? 0) + 500;
    }
  }

  const fuelSpend = patch.fuelSpend ?? v.fuelSpend ?? 0;
  const maintenanceSpend = patch.maintenanceSpend ?? v.maintenanceSpend ?? 0;
  const challanSpend = patch.challanSpend ?? v.challanSpend ?? 0;
  patch.totalSpend = fuelSpend + maintenanceSpend + challanSpend;

  return pickAllowed(patch);
}

const PATCH_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    healthScore: { type: "number" },
    fuelLevel: { type: "number" },
    odometerKm: { type: "number" },
    totalTrips: { type: "number" },
    totalSpend: { type: "number" },
    fuelSpend: { type: "number" },
    maintenanceSpend: { type: "number" },
    challanSpend: { type: "number" },
    insuranceStatus: { type: "string" },
    registrationStatus: { type: "string" },
    permitStatus: { type: "string" },
  },
};

export async function scoreVehicleWithLlm(v, ctx = {}) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return heuristicPatch(v, ctx);

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(
    /\/$/,
    "",
  );
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "vehicle_live_patch",
            strict: false,
            schema: PATCH_SCHEMA,
          },
        },
        messages: [
          {
            role: "system",
            content:
              "You score one fleet vehicle. Return JSON patch only using allowed keys. Keep healthScore 0-100, fuelLevel 0-100. Bump odometerKm from speed and dtSec. Mark insuranceStatus/registrationStatus/permitStatus EXPIRED when expiry dates are past. Do not invent columns. Small realistic deltas.",
          },
          {
            role: "user",
            content: JSON.stringify({ vehicle: snapshot(v, ctx), dtSec: ctx.dtSec ?? 35 }),
          },
        ],
      }),
    });
    if (!res.ok) return heuristicPatch(v, ctx);
    const body = await res.json();
    const text = body?.choices?.[0]?.message?.content;
    if (!text) return heuristicPatch(v, ctx);
    const parsed = JSON.parse(text);
    const allowed = pickAllowed(parsed);
    if (Object.keys(allowed).length === 0) return heuristicPatch(v, ctx);
    const fuelSpend = allowed.fuelSpend ?? v.fuelSpend ?? 0;
    const maintenanceSpend = allowed.maintenanceSpend ?? v.maintenanceSpend ?? 0;
    const challanSpend = allowed.challanSpend ?? v.challanSpend ?? 0;
    if (allowed.totalSpend === undefined) {
      allowed.totalSpend = fuelSpend + maintenanceSpend + challanSpend;
    }
    if (allowed.healthScore !== undefined) {
      allowed.healthScore = Math.round(clamp(Number(allowed.healthScore), 0, 100));
    }
    if (allowed.fuelLevel !== undefined) {
      allowed.fuelLevel = Math.round(clamp(Number(allowed.fuelLevel), 0, 100) * 10) / 10;
    }
    return allowed;
  } catch {
    return heuristicPatch(v, ctx);
  } finally {
    clearTimeout(t);
  }
}
