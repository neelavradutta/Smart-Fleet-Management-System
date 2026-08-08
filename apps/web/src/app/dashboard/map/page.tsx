"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crosshair, Navigation } from "lucide-react";
import { api } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { VehicleMapDynamic } from "@/components/dashboard/VehicleMapDynamic";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { PageHero } from "@/components/common/PageHero";
import { cn } from "@/utils/cn";

type Vehicle = {
  id: string;
  vehicleNumber: string;
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
        chip="GPS · Socket.IO"
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

        <Card accent="sky" className="xl:col-span-3 p-4 flex flex-col min-h-[280px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold text-slate-900">
              Fleet list
            </h3>
            <span className="sf-chip">{mapVehicles.length}</span>
          </div>
          <div className="space-y-2 overflow-y-auto flex-1 pr-1 sf-hide-scrollbar max-h-[560px]">
            {mapVehicles.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">
                No GPS positions yet
              </p>
            ) : (
              mapVehicles.map((v) => {
                const selected = focusId === v.id;
                return (
                  <motion.button
                    key={v.id}
                    type="button"
                    whileHover={{ x: 3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFocusId(v.id)}
                    className={cn(
                      "w-full text-left rounded-xl border p-3 transition-colors",
                      selected
                        ? "border-sky-400 bg-sky-50"
                        : "border-slate-100 bg-white hover:border-sky-200",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 text-sm">
                        {v.label}
                      </p>
                      <Crosshair
                        size={14}
                        className={selected ? "text-sky-600" : "text-slate-300"}
                      />
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 capitalize">
                      <Navigation size={12} />
                      {v.status} · {Math.round(v.speed)} km/h
                    </p>
                  </motion.button>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
