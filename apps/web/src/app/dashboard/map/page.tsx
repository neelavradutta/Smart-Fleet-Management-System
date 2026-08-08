"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { VehicleMapDynamic } from "@/components/dashboard/VehicleMapDynamic";
import { FleetSidePanel } from "@/components/dashboard/FleetSidePanel";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { PageHero } from "@/components/common/PageHero";

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

function mapStatus(status: string): "active" | "idle" | "offline" {
  const s = status.toUpperCase();
  if (s === "ACTIVE") return "active";
  if (s === "MAINTENANCE" || s === "IDLE") return "idle";
  return "offline";
}

export default function MapPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [live, setLive] = useState<Record<string, LocUpdate>>({});
  const [focusId, setFocusId] = useState<string | null>(null);
  const { data, connected } = useWebSocket<LocUpdate>("location_update");

  useEffect(() => {
    api<{ data: Vehicle[] }>("/api/v1/vehicles")
      .then((res) => setVehicles(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!data?.vehicleId) return;
    setLive((prev) => ({ ...prev, [data.vehicleId]: data }));
  }, [data]);

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
            status: mapStatus(v.status),
            vehicleType: v.vehicleType,
            plate: v.licensePlate ?? undefined,
            makeModel: [v.make, v.model].filter(Boolean).join(" ") || undefined,
            updatedAt: l?.timestamp ?? new Date().toISOString(),
          };
        })
        .filter(Boolean) as {
        id: string;
        label: string;
        latitude: number;
        longitude: number;
        speed: number;
        heading: number;
        status: "active" | "idle" | "offline";
      }[],
    [vehicles, live],
  );

  return (
    <div className="space-y-6">
      <PageHero
        theme="mint"
        title="Live map"
        subtitle="Full-tile street map with live vehicle tracks"
      >
        <Badge tone={connected ? "success" : "warning"} pulse={connected}>
          {connected ? "● Live" : "● Reconnecting"}
        </Badge>
      </PageHero>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Card
          accent="mint"
          className="xl:col-span-9 p-0 overflow-hidden h-[560px] sm:h-[640px]"
        >
          <VehicleMapDynamic vehicles={mapVehicles} focusId={focusId} />
        </Card>

        <div className="xl:col-span-3 h-[560px] sm:h-[640px]">
          <FleetSidePanel
            vehicles={mapVehicles}
            focusId={focusId}
            onFocus={setFocusId}
            connected={connected}
          />
        </div>
      </div>
    </div>
  );
}
