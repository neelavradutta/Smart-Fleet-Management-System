"use client";

import dynamic from "next/dynamic";
import type { MapVehicle } from "./VehicleMap";

const VehicleMap = dynamic(
  () => import("./VehicleMap").then((m) => m.VehicleMap),
  {
    ssr: false,
    loading: () => (
      <div className="sf-map-shell grid place-items-center bg-emerald-50 text-emerald-700 text-sm font-medium">
        Loading map tiles…
      </div>
    ),
  },
);

export function VehicleMapDynamic({
  vehicles,
  focusId = null,
}: {
  vehicles: MapVehicle[];
  focusId?: string | null;
}) {
  return (
    <div className="sf-map-shell">
      <VehicleMap vehicles={vehicles} focusId={focusId} />
    </div>
  );
}
