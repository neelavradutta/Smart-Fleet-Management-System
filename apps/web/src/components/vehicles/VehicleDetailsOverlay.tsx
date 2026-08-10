"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  FileText,
  HeartPulse,
  IndianRupee,
  MapPin,
  Navigation,
  Route,
  Shield,
  Truck,
  User,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { Badge } from "@/components/common/Badge";
import { cn } from "@/utils/cn";
import type { VehicleCardModel } from "@/components/vehicles/VehicleCard";

type DriverRow = {
  fullName: string;
  phone?: string | null;
  licenseNumber?: string | null;
  status?: string;
  safetyScore?: string | number | null;
  totalMiles?: number | null;
};

type AlertRow = {
  id: string;
  alertType: string;
  alertSeverity: string;
  alertMessage: string;
  isResolved: boolean;
  createdAt: string;
};

type DocRow = {
  id: string;
  title: string;
  docType: string;
  expiresAt?: string | null;
};

const panelVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 26,
      staggerChildren: 0.055,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: 28,
    scale: 0.96,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
  },
};

const child = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 320, damping: 24 },
  },
};

function relativeTime(iso?: string | null): string {
  if (!iso) return "unknown";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "unknown";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 48) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function derivedOps(vehicle: VehicleCardModel) {
  const health = vehicle.healthScore ?? 86;
  const fuel = vehicle.fuelLevel ?? 62;
  const seed = vehicle.vehicleNumber
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  const speedKmh =
    vehicle.status.toLowerCase() === "active" ? 28 + (seed % 42) : 0;
  const odometerKm = 18000 + (seed % 22000);
  const co2TodayKg = Number(
    ((speedKmh > 0 ? 4.2 : 0.3) + (seed % 7) * 0.35).toFixed(1),
  );
  const tripsToday =
    vehicle.status.toLowerCase() === "active" ? 2 + (seed % 4) : 0;
  const fuelSpend = 85000 + (seed % 55) * 2400;
  const maintenanceSpend = 22000 + (seed % 40) * 1800;
  const challanSpend = (seed % 9) * 1500;
  const totalSpend = fuelSpend + maintenanceSpend + challanSpend;
  return {
    health,
    fuel,
    speedKmh,
    odometerKm,
    co2TodayKg,
    tripsToday,
    fuelSpend,
    maintenanceSpend,
    challanSpend,
    totalSpend,
  };
}

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

const fmtPct = (n: number) => `${n}%`;
const fmtKm = (n: number) => `${n.toLocaleString("en-IN")} km`;
const fmtTrips = (n: number) => String(n);
const bumpPct = (d: number) => `+${d}%`;
const bumpKm = (d: number) => `+${d} km`;
const bumpInr = (d: number) => `+₹${d.toLocaleString("en-IN")}`;
const bumpTrips = (d: number) => `+${d}`;

function LiveMetricTile({
  label,
  icon: Icon,
  iconTint,
  bumpClass,
  base,
  active,
  reduce,
  intervalMs,
  firstDelayMs,
  deltaMin,
  deltaMax,
  formatValue,
  formatBump,
  max,
}: {
  label: string;
  icon: LucideIcon;
  iconTint: string;
  bumpClass: string;
  base: number;
  active: boolean;
  reduce: boolean | null;
  intervalMs: number;
  firstDelayMs: number;
  deltaMin: number;
  deltaMax: number;
  formatValue: (n: number) => string;
  formatBump: (delta: number) => string;
  max?: number;
}) {
  const [target, setTarget] = useState(base);
  const [bump, setBump] = useState<{ id: number; delta: number } | null>(null);
  const mv = useMotionValue(base);
  const display = useTransform(mv, (v) => formatValue(Math.round(v)));

  useEffect(() => {
    setTarget(base);
    mv.set(base);
    setBump(null);
  }, [base, mv]);

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const span = Math.max(0, deltaMax - deltaMin);
      const delta = deltaMin + Math.floor(Math.random() * (span + 1));
      setTarget((prev) => {
        if (max != null && prev >= max) return prev;
        const applied =
          max != null ? Math.min(delta, max - prev) : delta;
        if (applied > 0) {
          queueMicrotask(() =>
            setBump({ id: Date.now(), delta: applied }),
          );
        }
        return prev + applied;
      });
    };
    const id = window.setInterval(tick, intervalMs);
    const first = window.setTimeout(tick, firstDelayMs);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, [active, base, intervalMs, firstDelayMs, deltaMin, deltaMax, max]);

  useEffect(() => {
    if (reduce) {
      mv.set(target);
      return;
    }
    const ctrl = animate(mv, target, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => ctrl.stop();
  }, [target, mv, reduce]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
      <div
        className={cn(
          "mb-2 grid h-8 w-8 place-items-center rounded-xl",
          iconTint,
        )}
      >
        <Icon size={15} />
      </div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <motion.p className="text-lg font-semibold text-slate-900 leading-tight tabular-nums">
        {display}
      </motion.p>

      <AnimatePresence>
        {bump && !reduce ? (
          <motion.span
            key={bump.id}
            initial={{ opacity: 0, y: 10, scale: 0.85 }}
            animate={{ opacity: 1, y: -22, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() =>
              setBump((cur) => (cur?.id === bump.id ? null : cur))
            }
            className={cn(
              "pointer-events-none absolute right-2 top-9 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm",
              bumpClass,
            )}
          >
            {formatBump(bump.delta)}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function VehicleDetailsOverlay({
  open,
  vehicle,
  onClose,
}: {
  open: boolean;
  vehicle: VehicleCardModel | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [driver, setDriver] = useState<DriverRow | null>(null);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !vehicle) return;
    let alive = true;
    const number = vehicle.vehicleNumber;

    Promise.all([
      api<{ data: DriverRow[] }>("/api/v1/drivers").catch(() => ({ data: [] })),
      api<{ data: AlertRow[] }>("/api/v1/alerts").catch(() => ({ data: [] })),
      api<{ data: DocRow[] }>("/api/v1/documents").catch(() => ({ data: [] })),
    ]).then(([dRes, aRes, docRes]) => {
      if (!alive) return;
      const name = vehicle.currentDriverName?.trim();
      setDriver(
        name
          ? (dRes.data.find((d) => d.fullName === name) ?? null)
          : null,
      );
      setAlerts(
        aRes.data.filter(
          (a) =>
            !a.isResolved &&
            a.alertMessage.toUpperCase().includes(number.toUpperCase()),
        ),
      );
      setDocs(
        docRes.data.filter((d) =>
          d.title.toUpperCase().includes(number.toUpperCase()),
        ),
      );
    });

    return () => {
      alive = false;
    };
  }, [open, vehicle]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const ops = useMemo(
    () => (vehicle ? derivedOps(vehicle) : null),
    [vehicle],
  );

  if (!mounted) return null;

  const status = vehicle?.status.toLowerCase() ?? "";
  const isActive = status === "active";
  const isMaintenance = status === "maintenance";
  const headerBg = isActive
    ? "bg-rose-600"
    : isMaintenance
      ? "bg-amber-500"
      : "bg-slate-500";
  const badgeDot = isActive
    ? "bg-red-500"
    : isMaintenance
      ? "bg-amber-400"
      : "bg-slate-400";
  const badgeTone = isActive
    ? "danger"
    : isMaintenance
      ? "warning"
      : "neutral";

  return createPortal(
    <AnimatePresence>
      {open && vehicle && ops ? (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="vehicle-detail-title"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-t-[28px] sm:rounded-[28px] bg-white border border-slate-200 shadow-[0_28px_90px_-24px_rgba(15,23,42,0.4)]"
          >
            <div className={cn("relative px-5 sm:px-7 pt-5 pb-6 overflow-hidden", headerBg)}>
              <motion.span
                aria-hidden
                animate={reduce ? {} : { x: ["-40%", "140%"] }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="pointer-events-none absolute inset-y-0 w-48 bg-white/15 blur-2xl"
              />
              <div className="relative flex items-start justify-between gap-4">
                <motion.div variants={child} className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      pulse
                      tone={badgeTone}
                      dotClassName={badgeDot}
                      className="bg-white/95"
                    >
                      {vehicle.status}
                    </Badge>
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                      {vehicle.vehicleType ?? "Vehicle"}
                    </span>
                  </div>
                  <h2
                    id="vehicle-detail-title"
                    className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-white truncate"
                  >
                    {vehicle.vehicleNumber}
                  </h2>
                  <p className="mt-1 text-sm text-white/90">
                    {[vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
                      "Fleet unit"}
                    {vehicle.year ? ` · ${vehicle.year}` : ""}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-white/80">
                    <MapPin size={13} />
                    {vehicle.currentLatitude && vehicle.currentLongitude
                      ? `${Number(vehicle.currentLatitude).toFixed(4)}, ${Number(vehicle.currentLongitude).toFixed(4)}`
                      : "No GPS fix"}
                    <span className="opacity-70">
                      · GPS {relativeTime(vehicle.lastLocationUpdate)}
                    </span>
                  </p>
                </motion.div>

                <motion.button
                  variants={child}
                  type="button"
                  whileHover={{ rotate: 90, scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  aria-label="Close vehicle details"
                  className="shrink-0 grid place-items-center h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
                >
                  <X size={18} />
                </motion.button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(92vh-9.5rem)] px-5 sm:px-7 py-5 space-y-5 sf-hide-scrollbar">
              {ops.health < 35 ? (
                <motion.div
                  variants={child}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-700 border border-red-900 text-red-50"
                >
                  <AlertCircle size={16} />
                  <span className="text-sm font-semibold">
                    Service Required — health below 35%
                  </span>
                </motion.div>
              ) : null}

              <motion.div
                variants={child}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                <LiveMetricTile
                  label="Health"
                  icon={HeartPulse}
                  iconTint="bg-rose-50 text-rose-600"
                  bumpClass="bg-rose-500"
                  base={ops.health}
                  active={open}
                  reduce={reduce}
                  intervalMs={5200}
                  firstDelayMs={2600}
                  deltaMin={1}
                  deltaMax={2}
                  max={100}
                  formatValue={fmtPct}
                  formatBump={bumpPct}
                />
                <LiveMetricTile
                  label="Odometer"
                  icon={Route}
                  iconTint="bg-sky-50 text-sky-600"
                  bumpClass="bg-sky-500"
                  base={ops.odometerKm}
                  active={open}
                  reduce={reduce}
                  intervalMs={5000}
                  firstDelayMs={2400}
                  deltaMin={1}
                  deltaMax={5}
                  formatValue={fmtKm}
                  formatBump={bumpKm}
                />
                <LiveMetricTile
                  label="Vehicle spend"
                  icon={IndianRupee}
                  iconTint="bg-amber-50 text-amber-700"
                  bumpClass="bg-amber-500"
                  base={ops.totalSpend}
                  active={open}
                  reduce={reduce}
                  intervalMs={4800}
                  firstDelayMs={2200}
                  deltaMin={80}
                  deltaMax={450}
                  formatValue={formatInr}
                  formatBump={bumpInr}
                />
                <LiveMetricTile
                  label="Trips today"
                  icon={Navigation}
                  iconTint="bg-emerald-50 text-emerald-600"
                  bumpClass="bg-emerald-500"
                  base={ops.tripsToday}
                  active={open}
                  reduce={reduce}
                  intervalMs={5600}
                  firstDelayMs={3000}
                  deltaMin={1}
                  deltaMax={1}
                  formatValue={fmtTrips}
                  formatBump={bumpTrips}
                />
              </motion.div>

              <motion.section variants={child}>
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Truck size={15} className="text-sky-600" />
                  Vehicle profile
                </h3>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                  {[
                    ["License plate", vehicle.licensePlate ?? "—"],
                    ["VIN", vehicle.vin ?? "—"],
                    ["Type", vehicle.vehicleType ?? "—"],
                    ["Year", vehicle.year?.toString() ?? "—"],
                    [
                      "Payload",
                      vehicle.capacityWeightKg != null
                        ? `${vehicle.capacityWeightKg.toLocaleString()} kg`
                        : "—",
                    ],
                    [
                      "Volume",
                      vehicle.capacityVolumeM3 != null
                        ? `${vehicle.capacityVolumeM3} m³`
                        : "—",
                    ],
                    [
                      "Fuel spend",
                      formatInr(ops.fuelSpend),
                    ],
                    [
                      "Maintenance",
                      formatInr(ops.maintenanceSpend),
                    ],
                    [
                      "Challans",
                      formatInr(ops.challanSpend),
                    ],
                    ["CO₂ today", `${ops.co2TodayKg} kg`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-500">{k}</span>
                      <span className="font-medium text-slate-900 text-right">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.section>

              <motion.section variants={child}>
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <User size={15} className="text-violet-600" />
                  Assigned driver
                </h3>
                {isActive && (driver || vehicle.currentDriverName) ? (
                  <div className="rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-violet-100 text-violet-700 grid place-items-center shrink-0">
                      <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">
                        {driver?.fullName ?? vehicle.currentDriverName}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {driver?.phone ?? "Phone on file"}
                        {driver?.licenseNumber
                          ? ` · Lic ${driver.licenseNumber}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center">
                        <p className="text-[10px] uppercase text-emerald-700/80 flex items-center gap-1 justify-center">
                          <Shield size={10} /> Safety
                        </p>
                        <p className="text-sm font-bold text-emerald-800">
                          {driver?.safetyScore ?? "—"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-sky-50 px-3 py-2 text-center">
                        <p className="text-[10px] uppercase text-sky-700/80">
                          Miles
                        </p>
                        <p className="text-sm font-bold text-sky-800">
                          {driver?.totalMiles?.toLocaleString() ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    No driver assigned — unit is{" "}
                    {status || "unavailable"} for dispatch.
                  </div>
                )}
              </motion.section>

              <motion.section variants={child}>
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <AlertCircle size={15} className="text-amber-600" />
                  Open alerts
                </h3>
                {alerts.length ? (
                  <ul className="space-y-2">
                    {alerts.map((a, i) => (
                      <motion.li
                        key={a.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.05 }}
                        className="rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wide text-amber-800">
                            {a.alertSeverity} · {a.alertType.replaceAll("_", " ")}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {relativeTime(a.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-800 mt-1">
                          {a.alertMessage}
                        </p>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    No open alerts for this vehicle.
                  </p>
                )}
              </motion.section>

              <motion.section variants={child}>
                <h3 className="font-display text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText size={15} className="text-sky-600" />
                  Compliance documents
                </h3>
                {docs.length ? (
                  <ul className="space-y-2">
                    {docs.map((d) => (
                      <li
                        key={d.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {d.title}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {d.docType}
                            {d.expiresAt ? ` · expires ${d.expiresAt}` : ""}
                          </p>
                        </div>
                        <FileText size={14} className="text-slate-300 shrink-0" />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    No vehicle documents linked yet.
                  </p>
                )}
              </motion.section>

              <motion.div
                variants={child}
                className="flex flex-wrap gap-3 pb-2 pt-1"
              >
                <Link
                  href="/dashboard/map"
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
                  onClick={onClose}
                >
                  <MapPin size={15} />
                  Open live map
                </Link>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
