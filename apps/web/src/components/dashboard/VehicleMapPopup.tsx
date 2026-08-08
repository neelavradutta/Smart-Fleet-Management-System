"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import type { MapVehicle } from "./VehicleMap";

const STATUS = {
  active: { fill: "#16a34a", label: "Active" },
  idle: { fill: "#d97706", label: "Idle" },
  offline: { fill: "#64748b", label: "Offline" },
} as const;

const R = 18;
const C = 2 * Math.PI * R;

function Gauge({
  progress,
  color,
  value,
  decimals,
  unit,
  label,
  delay = 0,
}: {
  progress: number;
  color: string;
  value: number | null;
  decimals?: number;
  unit: string;
  label: string;
  delay?: number;
}) {
  const p = Math.min(1, Math.max(0, progress));
  const offset = C * (1 - p);

  return (
    <motion.div
      className="sf-gauge"
      initial={{ opacity: 0, scale: 0.7, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay,
        type: "spring",
        stiffness: 340,
        damping: 20,
      }}
    >
      <div className="sf-gauge-ring">
        <svg viewBox="0 0 44 44" width="52" height="52" aria-hidden>
          <circle
            cx="22"
            cy="22"
            r={R}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="3.5"
          />
          <motion.circle
            cx="22"
            cy="22"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              delay: delay + 0.1,
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            transform="rotate(-90 22 22)"
          />
        </svg>
        <div className="sf-gauge-center">
          {value == null ? (
            <motion.span
              className="sf-gauge-num"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              —
            </motion.span>
          ) : (
            <AnimatedNumber
              value={value}
              decimals={decimals ?? 0}
              flash
              className="sf-gauge-num"
            />
          )}
          <span className="sf-gauge-unit">{unit}</span>
        </div>
      </div>
      <motion.p
        className="sf-gauge-label"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        {label}
      </motion.p>
    </motion.div>
  );
}

function formatEta(minutes: number | null | undefined): {
  value: number | null;
  unit: string;
  progress: number;
} {
  if (minutes == null || !Number.isFinite(minutes)) {
    return { value: null, unit: "eta", progress: 0 };
  }
  if (minutes < 0) return { value: 0, unit: "min", progress: 1 };
  if (minutes < 60) {
    return {
      value: Math.round(minutes),
      unit: "min",
      progress: 1 - Math.min(1, minutes / 90),
    };
  }
  return {
    value: Number((minutes / 60).toFixed(1)),
    unit: "hr",
    progress: 1 - Math.min(1, minutes / 180),
  };
}

export function VehicleMapPopup({ vehicle }: { vehicle: MapVehicle }) {
  const status = vehicle.status ?? "active";
  const speed = Math.max(0, vehicle.speed ?? 0);
  const dist = Math.max(0, vehicle.distanceKm ?? 0);
  const eta = formatEta(vehicle.etaMinutes);

  return (
    <motion.div
      className="sf-popup-card"
      initial={{ opacity: 0, y: 10, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 360, damping: 24 }}
    >
      <div className="sf-popup-top">
        <div className="sf-popup-id-row">
          <motion.p
            className="sf-popup-title"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {vehicle.label}
          </motion.p>
          <motion.span
            className="sf-popup-status"
            style={{ background: STATUS[status].fill }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 16 }}
          >
            {STATUS[status].label}
          </motion.span>
        </div>
        <motion.p
          className="sf-popup-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {[vehicle.vehicleType, vehicle.makeModel, vehicle.plate]
            .filter(Boolean)
            .join(" · ") || "En route"}
        </motion.p>
      </div>

      <div className="sf-popup-gauges">
        <Gauge
          progress={Math.min(1, speed / 80)}
          color={STATUS[status].fill}
          value={speed}
          unit="km/h"
          label="Speed"
          delay={0.05}
        />
        <Gauge
          progress={Math.min(1, Math.max(0.05, 1 - dist / 20))}
          color="#0ea5e9"
          value={dist}
          decimals={1}
          unit="km"
          label="Left"
          delay={0.12}
        />
        <Gauge
          progress={eta.progress}
          color="#f59e0b"
          value={eta.value}
          decimals={eta.unit === "hr" ? 1 : 0}
          unit={eta.unit === "eta" ? "" : eta.unit}
          label="ETA"
          delay={0.19}
        />
      </div>

      <motion.div
        className="sf-popup-foot"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
      >
        <span>
          {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
        </span>
        <motion.span
          key={vehicle.updatedAt ?? "t"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {vehicle.updatedAt
            ? new Date(vehicle.updatedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "—"}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
