"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ChevronRight, Fuel, HeartPulse } from "lucide-react";
import { Badge } from "@/components/common/Badge";

export type VehicleCardModel = {
  id: string;
  vehicleNumber: string;
  status: string;
  make?: string | null;
  model?: string | null;
  licensePlate?: string | null;
  currentLatitude?: string | null;
  currentLongitude?: string | null;
  currentDriverName?: string | null;
  healthScore?: number;
  fuelLevel?: number;
  maintenanceDue?: boolean;
};

export function VehicleCard({ vehicle }: { vehicle: VehicleCardModel }) {
  const health = vehicle.healthScore ?? 86;
  const fuel = vehicle.fuelLevel ?? 62;
  const status = vehicle.status.toLowerCase();
  const isActive = status === "active";
  const driverName =
    isActive && vehicle.currentDriverName?.trim()
      ? vehicle.currentDriverName.trim()
      : "unassigned";
  const driverLine = `Current driver - ${driverName}`;

  return (
    <Link href={`/dashboard/vehicles?focus=${vehicle.id}`}>
      <motion.div
        whileHover={{ y: -6, scale: 1.015 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 360, damping: 22 }}
        className="bg-white border border-sky-200 rounded-2xl p-6 shadow-card hover:shadow-soft relative overflow-hidden group"
      >
        <span className="absolute top-0 left-0 right-0 h-1 bg-sky-500" />
        <span className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-sky-300/35 blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                {vehicle.vehicleNumber}
              </h3>
              <p className="text-sm text-slate-500">
                {[vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
                  vehicle.licensePlate ||
                  "—"}
              </p>
              <p className="text-xs text-slate-600 mt-1">{driverLine}</p>
            </div>
            <Badge
              pulse={isActive}
              tone={
                isActive
                  ? "success"
                  : status === "maintenance"
                    ? "warning"
                    : "neutral"
              }
            >
              {vehicle.status}
            </Badge>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-500 inline-flex items-center gap-1">
                <HeartPulse size={12} className="text-rose-400" /> Health
              </span>
              <span className="font-semibold text-slate-900">{health}%</span>
            </div>
            <div className="sf-bar">
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: `${health}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className={
                  health > 80
                    ? "!bg-emerald-500"
                    : health > 50
                      ? "!bg-amber-500"
                      : "!bg-rose-500"
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 grid place-items-center">
                <Fuel size={16} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Fuel</p>
                <p className="text-lg font-semibold text-slate-900">{fuel}%</p>
              </div>
            </div>
            {vehicle.maintenanceDue ? (
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 rounded-xl border border-amber-200"
              >
                <AlertCircle size={14} className="text-amber-600" />
                <span className="text-xs font-medium text-amber-700">
                  Maintenance
                </span>
              </motion.div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 text-sky-600 font-medium text-sm group-hover:gap-3 transition-all duration-300">
            <span>View details</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
