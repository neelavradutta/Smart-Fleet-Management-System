"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Fuel, Gauge, ShieldCheck, Truck } from "lucide-react";
import toast from "react-hot-toast";
import { api, getUser } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { RealtimeMetrics } from "@/components/dashboard/RealtimeMetrics";
import { AlertsPanel, type AlertItem } from "@/components/dashboard/AlertsPanel";
import { VehicleMapDynamic } from "@/components/dashboard/VehicleMapDynamic";
import { Card } from "@/components/common/Card";
import { LoadingBlock } from "@/components/common/LoadingBlock";
import { PageHero } from "@/components/common/PageHero";
import { PerformanceChart } from "@/components/analytics/PerformanceChart";

type Overview = {
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  avgSafetyScore: number;
  onTimeDeliveryRate: number;
  totalCo2Kg: number;
};

type Vehicle = {
  id: string;
  vehicleNumber: string;
  vehicleType?: string;
  make?: string | null;
  model?: string | null;
  licensePlate?: string | null;
  status: string;
  currentLatitude: string | null;
  currentLongitude: string | null;
};

type LocUpdate = {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading?: number;
  timestamp?: string;
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [live, setLive] = useState<Record<string, LocUpdate>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);
  const { data: loc, connected } = useWebSocket<LocUpdate>("location_update");
  const { data: alertEvent } = useWebSocket<AlertItem>("alert");

  useEffect(() => {
    setUser(getUser());
  }, []);

  const load = useCallback(async () => {
    try {
      const [o, v, a] = await Promise.all([
        api<{ data: Overview }>("/api/v1/analytics/fleet-overview"),
        api<{ data: Vehicle[] }>("/api/v1/vehicles"),
        api<{ data: AlertItem[] }>("/api/v1/alerts"),
      ]);
      setOverview(o.data);
      setVehicles(v.data);
      setAlerts(a.data);
      setError(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => load().catch(() => undefined), 30000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!loc?.vehicleId) return;
    setLive((prev) => ({ ...prev, [loc.vehicleId]: loc }));
  }, [loc]);

  useEffect(() => {
    if (!alertEvent?.id) return;
    setAlerts((prev) => [
      alertEvent,
      ...prev.filter((a) => a.id !== alertEvent.id),
    ]);
  }, [alertEvent]);

  const mapVehicles = useMemo(
    () =>
      vehicles
        .map((v) => {
          const l = live[v.id];
          const lat = l?.latitude ?? Number(v.currentLatitude);
          const lng = l?.longitude ?? Number(v.currentLongitude);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
          return {
            id: v.id,
            label: v.vehicleNumber,
            latitude: lat,
            longitude: lng,
            speed: l?.speed ?? 0,
            heading: l?.heading ?? 0,
            status:
              v.status === "ACTIVE"
                ? ("active" as const)
                : v.status === "MAINTENANCE"
                  ? ("idle" as const)
                  : ("offline" as const),
            vehicleType: v.vehicleType,
            plate: v.licensePlate ?? undefined,
            makeModel: [v.make, v.model].filter(Boolean).join(" ") || undefined,
            updatedAt: l?.timestamp,
          };
        })
        .filter(Boolean) as {
        id: string;
        label: string;
        latitude: number;
        longitude: number;
        speed: number;
        status: "active" | "idle" | "offline";
      }[],
    [vehicles, live],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingBlock label="Loading fleet overview…" />
        <LoadingBlock />
      </div>
    );
  }

  if (error && !overview) {
    return (
      <Card className="border-red-200 bg-red-50">
        <p className="font-medium text-red-800">{error}</p>
        <p className="text-sm text-red-700 mt-1">
          Start demo API: `pnpm --filter @sfms/demo-api dev`
        </p>
        <button
          type="button"
          className="mt-4 text-sm font-medium text-brand-700 underline"
          onClick={() => {
            setLoading(true);
            load();
          }}
        >
          Retry
        </button>
      </Card>
    );
  }

  const metrics = [
    {
      label: "Active vehicles",
      value: overview?.activeVehicles ?? "—",
      unit: `/ ${overview?.totalVehicles ?? "—"}`,
      trend: 4,
      color: "cyan" as const,
      icon: <Truck size={20} />,
    },
    {
      label: "On-time rate",
      value: overview ? overview.onTimeDeliveryRate.toFixed(0) : "—",
      unit: "%",
      trend: 2,
      color: "green" as const,
      icon: <Gauge size={20} />,
    },
    {
      label: "Avg safety",
      value: overview ? overview.avgSafetyScore.toFixed(1) : "—",
      unit: "/100",
      trend: 1,
      color: "purple" as const,
      icon: <ShieldCheck size={20} />,
    },
    {
      label: "CO₂ footprint",
      value: overview ? overview.totalCo2Kg.toFixed(0) : "—",
      unit: "kg",
      trend: -3,
      color: "amber" as const,
      icon: <Fuel size={20} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHero
        theme="sky"
        title="Fleet overview"
        subtitle={`${user?.fleetName ?? "Fleet"} · map updates every ~3s · WS ${connected ? "live" : "connecting…"}`}
      />

      <RealtimeMetrics metrics={metrics} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <Card
          accent="sky"
          className="xl:col-span-8 p-0 overflow-hidden h-[440px]"
        >
          <div className="px-4 py-3 border-b border-sky-100 flex items-center justify-between bg-sky-50">
            <h2 className="font-display font-semibold text-sky-900">
              Live vehicle map
            </h2>
            <span className="sf-chip">{mapVehicles.length} tracked</span>
          </div>
          <div className="h-[calc(100%-52px)] min-h-[360px]">
            <VehicleMapDynamic vehicles={mapVehicles} />
          </div>
        </Card>
        <div className="xl:col-span-4">
          <AlertsPanel alerts={alerts} onResolved={load} />
        </div>
      </div>

      <PerformanceChart />
    </div>
  );
}
