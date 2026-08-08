"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import type { MapVehicle } from "./VehicleMap";

const STATUS = {
  active: { fill: "#16a34a", label: "Active" },
  idle: { fill: "#d97706", label: "Idle" },
  offline: { fill: "#64748b", label: "Offline" },
} as const;

function formatEta(minutes: number | null | undefined): {
  value: number;
  unit: string;
} {
  if (minutes == null || !Number.isFinite(minutes) || minutes < 0) {
    return { value: 0, unit: "—" };
  }
  if (minutes < 60) return { value: minutes, unit: "min" };
  const h = minutes / 60;
  return { value: h, unit: "hr" };
}

const cell = {
  hidden: { opacity: 0, y: 6 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 + i * 0.06, type: "spring" as const, stiffness: 320, damping: 22 },
  }),
};

export function VehicleMapPopup({ vehicle }: { vehicle: MapVehicle }) {
  const status = vehicle.status ?? "active";
  const speed = Math.max(0, vehicle.speed ?? 0);
  const dist = Math.max(0, vehicle.distanceKm ?? 0);
  const eta = formatEta(vehicle.etaMinutes);
  const etaDecimals = eta.unit === "hr" ? 1 : 0;

  return (
    <motion.div
      className="sf-popup-card"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
    >
      <div className="sf-popup-top">
        <div className="sf-popup-id-row">
          <motion.p
            className="sf-popup-title"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {vehicle.label}
          </motion.p>
          <motion.span
            className="sf-popup-status"
            style={{ background: STATUS[status].fill }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 18 }}
          >
            {STATUS[status].label}
          </motion.span>
        </div>
        <motion.p
          className="sf-popup-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
        >
          {[vehicle.vehicleType, vehicle.makeModel, vehicle.plate]
            .filter(Boolean)
            .join(" · ") || "En route"}
        </motion.p>
      </div>

      <div className="sf-popup-grid">
        <motion.div
          className="sf-popup-cell"
          custom={0}
          variants={cell}
          initial="hidden"
          animate="show"
        >
          <p className="sf-popup-val">
            <AnimatedNumber value={speed} decimals={0} flash className="sf-popup-anim" />
            <span> km/h</span>
          </p>
          <p className="sf-popup-key">Speed</p>
          <motion.span
            className="sf-popup-meter"
            animate={{ scaleX: Math.min(1, speed / 80) }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            style={{ originX: 0, background: STATUS[status].fill }}
          />
        </motion.div>

        <motion.div
          className="sf-popup-cell"
          custom={1}
          variants={cell}
          initial="hidden"
          animate="show"
        >
          <p className="sf-popup-val">
            <AnimatedNumber value={dist} decimals={1} flash className="sf-popup-anim" />
            <span> km</span>
          </p>
          <p className="sf-popup-key">Left</p>
          <motion.span
            className="sf-popup-meter"
            animate={{ scaleX: Math.min(1, Math.max(0.08, 1 - dist / 25)) }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            style={{ originX: 0, background: "#0ea5e9" }}
          />
        </motion.div>

        <motion.div
          className="sf-popup-cell"
          custom={2}
          variants={cell}
          initial="hidden"
          animate="show"
        >
          <p className="sf-popup-val">
            {eta.unit === "—" ? (
              <span className="sf-popup-anim">—</span>
            ) : (
              <AnimatedNumber
                value={eta.value}
                decimals={etaDecimals}
                flash
                className="sf-popup-anim"
              />
            )}
            <span> {eta.unit === "—" ? "" : eta.unit}</span>
          </p>
          <p className="sf-popup-key">ETA</p>
          <motion.span
            className="sf-popup-meter"
            animate={{
              scaleX:
                eta.unit === "—"
                  ? 0
                  : Math.min(
                      1,
                      Math.max(
                        0.1,
                        1 - (eta.unit === "hr" ? eta.value * 60 : eta.value) / 90,
                      ),
                    ),
            }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            style={{ originX: 0, background: "#f59e0b" }}
          />
        </motion.div>
      </div>

      <motion.div
        className="sf-popup-foot"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span>
          {vehicle.latitude.toFixed(4)}, {vehicle.longitude.toFixed(4)}
        </span>
        <motion.span
          key={vehicle.updatedAt ?? "t"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
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
