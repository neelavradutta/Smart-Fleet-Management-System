export type RouteStop = {
  id: string;
  seq: number;
  label: string;
  address?: string | null;
  lat: number;
  lng: number;
  eta?: string | null;
  status: string;
};

export type RouteDetails = {
  id: string;
  code: string;
  name: string;
  corridor: string;
  depot?: string | null;
  routeType: string;
  routeStatus: string;
  vehicleId?: string | null;
  vehicleNumber?: string | null;
  licensePlate?: string | null;
  driverId?: string | null;
  driverName?: string | null;
  driverCode?: string | null;
  plannedDistanceKm?: string | number | null;
  actualDistanceKm?: string | number | null;
  plannedDurationMinutes?: number | null;
  actualDurationMinutes?: number | null;
  plannedStartTime?: string | null;
  actualStartTime?: string | null;
  plannedEndTime?: string | null;
  actualEndTime?: string | null;
  totalStops: number;
  completedStops: number;
  optimizationScore?: string | number | null;
  efficiencyScore?: string | number | null;
  co2Kg?: string | number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  stops: RouteStop[];
};

export const ROUTE_STATUS: Record<
  string,
  { label: string; tone: "success" | "warning" | "danger" | "info" | "neutral" }
> = {
  PLANNED: { label: "Planned", tone: "info" },
  ACTIVE: { label: "Active", tone: "success" },
  COMPLETED: { label: "Completed", tone: "neutral" },
  CANCELLED: { label: "Cancelled", tone: "danger" },
};

export const ROUTE_TYPE: Record<string, string> = {
  DELIVERY: "Delivery",
  COLLECTION: "Collection",
  SERVICE: "Service",
  SWEEP: "Sweep",
};

export const STOP_STATUS: Record<
  string,
  { label: string; tone: "success" | "warning" | "danger" | "info" | "neutral" }
> = {
  PENDING: { label: "Pending", tone: "info" },
  ARRIVED: { label: "Arrived", tone: "warning" },
  COMPLETED: { label: "Done", tone: "success" },
  SKIPPED: { label: "Skipped", tone: "danger" },
};

export function isRouteDelayed(route: RouteDetails): boolean {
  if (route.routeStatus !== "ACTIVE" || !route.plannedEndTime) return false;
  return new Date(route.plannedEndTime).getTime() < Date.now();
}

export function nextPendingStop(route: RouteDetails): RouteStop | null {
  return route.stops?.find((s) => s.status === "PENDING") ?? null;
}

export function routeProgress(route: RouteDetails): number {
  if (!route.totalStops) return 0;
  return Math.min(100, Math.round((route.completedStops / route.totalStops) * 100));
}

export function fmtKm(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("en-IN", { maximumFractionDigits: 1 });
}

export function fmtScore(value: string | number | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toFixed(1);
}

export function fmtWhen(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fmtMins(value?: number | null): string {
  if (value == null) return "—";
  const h = Math.floor(value / 60);
  const m = value % 60;
  if (h <= 0) return `${m} min`;
  return `${h}h ${m}m`;
}
