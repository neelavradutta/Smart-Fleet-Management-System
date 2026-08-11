"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ChevronDown,
  ClipboardList,
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
import { Badge } from "@/components/common/Badge";
import { LiveMetricTile } from "@/components/common/LiveMetricTile";
import { cn } from "@/utils/cn";
import type { VehicleCardModel } from "@/components/vehicles/VehicleCard";

type ComplianceAlert = {
  id: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  label: string;
  message: string;
  daysLeft: number | null;
};

function parseDateOnly(value?: string | null): Date | null {
  if (!value || value === "—" || value.toUpperCase() === "N/A") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function daysUntil(date: Date): number {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

/** Alerts only from overlay compliance dates (expiry soon / expired). */
function buildComplianceAlerts(vehicle: VehicleCardModel): ComplianceAlert[] {
  const WARN_DAYS = 60;
  const checks: Array<{ id: string; label: string; date?: string | null }> = [
    {
      id: "registration",
      label: "Registration",
      date: vehicle.registrationExpiry,
    },
    {
      id: "insurance",
      label: "Insurance",
      date: vehicle.insuranceExpiryDate,
    },
    { id: "puc", label: "PUC", date: vehicle.pucExpiryDate },
    { id: "permit", label: "Permit", date: vehicle.permitExpiry },
  ];

  const out: ComplianceAlert[] = [];

  for (const check of checks) {
    const d = parseDateOnly(check.date);
    if (!d) continue;
    const left = daysUntil(d);
    if (left < 0) {
      out.push({
        id: check.id,
        severity: "CRITICAL",
        label: `${check.label} expired`,
        message: `${check.label} expired on ${check.date} (${Math.abs(left)} day${Math.abs(left) === 1 ? "" : "s"} ago).`,
        daysLeft: left,
      });
    } else if (left <= WARN_DAYS) {
      out.push({
        id: check.id,
        severity: left <= 15 ? "CRITICAL" : "WARNING",
        label: `${check.label} expiring`,
        message: `${check.label} expires on ${check.date} — ${left} day${left === 1 ? "" : "s"} left.`,
        daysLeft: left,
      });
    }
  }

  const fitness = vehicle.fitnessCertificate?.toLowerCase() ?? "";
  if (fitness.includes("expired")) {
    out.push({
      id: "fitness",
      severity: "CRITICAL",
      label: "Fitness expired",
      message: vehicle.fitnessCertificate ?? "Fitness certificate expired.",
      daysLeft: null,
    });
  }

  if (vehicle.insuranceStatus?.toUpperCase() === "EXPIRED") {
    const d = parseDateOnly(vehicle.insuranceExpiryDate);
    const left = d ? daysUntil(d) : -1;
    // Status alone only alerts if date also expired / missing — renew clears both.
    if ((left < 0 || !d) && !out.some((a) => a.id === "insurance")) {
      out.push({
        id: "insurance-status",
        severity: "CRITICAL",
        label: "Insurance inactive",
        message: "Insurance status is EXPIRED on this vehicle.",
        daysLeft: left < 0 ? left : null,
      });
    }
  }

  // Soonest expiry first, then expired
  out.sort((a, b) => {
    const av = a.daysLeft ?? -9999;
    const bv = b.daysLeft ?? -9999;
    return av - bv;
  });

  return out;
}

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
  const totalTrips = 86 + (seed % 240);
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
    totalTrips,
    fuelSpend,
    maintenanceSpend,
    challanSpend,
    totalSpend,
  };
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

const fmtPct = (n: number) => `${n}%`;
const fmtKm = (n: number) => `${n.toLocaleString("en-IN")} km`;
const fmtTrips = (n: number) => String(n);
const bumpPct = (d: number) => `${d > 0 ? "+" : ""}${d}%`;
const bumpKm = (d: number) => `${d > 0 ? "+" : ""}${d} km`;
const bumpInr = (d: number) =>
  `${d > 0 ? "+" : "-"}₹${Math.abs(d).toLocaleString("en-IN")}`;
const bumpTrips = (d: number) => `${d > 0 ? "+" : ""}${d}`;

function OverlaySection({
  title,
  icon: Icon,
  iconClass,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: LucideIcon;
  iconClass: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.section variants={child}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mb-3 flex w-full items-center gap-2 text-left"
      >
        <Icon size={15} className={iconClass} />
        <span className="font-display text-sm font-semibold text-slate-900 flex-1">
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}

function DriverHistoryCard({
  entry,
}: {
  entry: {
    fullName: string;
    checkInAt: string;
    checkOutAt?: string | null;
    safetyScore?: string | number | null;
    totalMiles?: number | null;
  };
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="h-12 w-12 rounded-2xl bg-violet-100 text-violet-700 grid place-items-center shrink-0">
        <User size={20} />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <p className="font-semibold text-slate-900">{entry.fullName}</p>
        <div className="space-y-1 text-xs text-slate-500">
          <p>
            <span className="text-slate-400">Check-in</span>
            <span className="ml-2 font-medium text-slate-700">
              {formatDateTime(entry.checkInAt)}
            </span>
          </p>
          <p>
            <span className="text-slate-400">Check-out</span>
            <span className="ml-2 font-medium text-slate-700">
              {entry.checkOutAt
                ? formatDateTime(entry.checkOutAt)
                : "In progress"}
            </span>
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center">
          <p className="text-[10px] uppercase text-emerald-700/80 flex items-center gap-1 justify-center">
            <Shield size={10} /> Safety
          </p>
          <p className="text-sm font-bold text-emerald-800">
            {entry.safetyScore ?? "—"}
          </p>
        </div>
        <div className="rounded-xl bg-sky-50 px-3 py-2 text-center">
          <p className="text-[10px] uppercase text-sky-700/80">Miles</p>
          <p className="text-sm font-bold text-sky-800">
            {entry.totalMiles?.toLocaleString() ?? "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function AssignedDriversBlock({
  history,
}: {
  history: NonNullable<VehicleCardModel["driverHistory"]>;
}) {
  const [showMore, setShowMore] = useState(false);
  const sorted = useMemo(
    () =>
      [...history].sort(
        (a, b) =>
          new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime(),
      ),
    [history],
  );
  const latest = sorted[0];
  const previous = sorted.slice(1, 6);

  if (!latest) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
        No driver history for this vehicle.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <DriverHistoryCard entry={latest} />

      {previous.length ? (
        <div>
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <span>
              {showMore ? "Hide" : "Show"} previous drivers ({previous.length})
            </span>
            <motion.span
              animate={{ rotate: showMore ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-400"
            >
              <ChevronDown size={16} />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {showMore ? (
              <motion.ul
                key="prev-drivers"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden space-y-3 mt-3"
              >
                {previous.map((entry, i) => (
                  <li key={`${entry.fullName}-${entry.checkInAt}-${i}`}>
                    <DriverHistoryCard entry={entry} />
                  </li>
                ))}
              </motion.ul>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
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
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const complianceAlerts = useMemo(
    () => (vehicle ? buildComplianceAlerts(vehicle) : []),
    [vehicle],
  );

  if (!mounted) return null;

  const vehicleView = vehicle;
  const status = vehicleView?.status.toLowerCase() ?? "";
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
      {open && vehicleView && ops ? (
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
            <div className={cn("relative px-5 sm:px-7 pt-5 pb-6", headerBg)}>
              <div className="relative flex items-start justify-between gap-4">
                <motion.div variants={child} className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      pulse
                      tone={badgeTone}
                      dotClassName={badgeDot}
                      className="bg-white/95"
                    >
                      {vehicleView.status}
                    </Badge>
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                      {vehicleView.vehicleType ?? "Vehicle"}
                    </span>
                  </div>
                  <h2
                    id="vehicle-detail-title"
                    className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-white truncate"
                  >
                    {vehicleView.vehicleNumber}
                  </h2>
                  <p className="mt-1 text-sm text-white/90">
                    {[vehicleView.make, vehicleView.model].filter(Boolean).join(" ") ||
                      "Fleet unit"}
                    {vehicleView.year ? ` · ${vehicleView.year}` : ""}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-white/80">
                    <MapPin size={13} />
                    {vehicleView.currentLatitude && vehicleView.currentLongitude
                      ? `${Number(vehicleView.currentLatitude).toFixed(4)}, ${Number(vehicleView.currentLongitude).toFixed(4)}`
                      : "No GPS fix"}
                    <span className="opacity-70">
                      · Last recorded{" "}
                      {relativeTime(vehicleView.lastLocationUpdate)}
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
                  bumpDownClass="bg-rose-700"
                  base={ops.health}
                  active={open}
                  reduce={reduce}
                  intervalMs={5200}
                  firstDelayMs={2600}
                  deltaMin={-2}
                  deltaMax={2}
                  min={0}
                  max={100}
                  formatValue={fmtPct}
                  formatBump={bumpPct}
                />
                <LiveMetricTile
                  label="Odometer"
                  icon={Route}
                  iconTint="bg-sky-50 text-sky-600"
                  bumpClass="bg-sky-500"
                  bumpDownClass="bg-sky-700"
                  base={ops.odometerKm}
                  active={open}
                  reduce={reduce}
                  intervalMs={5000}
                  firstDelayMs={2400}
                  deltaMin={-3}
                  deltaMax={5}
                  min={0}
                  formatValue={fmtKm}
                  formatBump={bumpKm}
                />
                <LiveMetricTile
                  label="Vehicle spending"
                  icon={IndianRupee}
                  iconTint="bg-amber-50 text-amber-700"
                  bumpClass="bg-amber-500"
                  bumpDownClass="bg-amber-700"
                  base={ops.totalSpend}
                  active={open}
                  reduce={reduce}
                  intervalMs={4800}
                  firstDelayMs={2200}
                  deltaMin={-220}
                  deltaMax={450}
                  min={0}
                  formatValue={formatInr}
                  formatBump={bumpInr}
                />
                <LiveMetricTile
                  label="Total trips"
                  icon={Navigation}
                  iconTint="bg-emerald-50 text-emerald-600"
                  bumpClass="bg-emerald-500"
                  bumpDownClass="bg-emerald-700"
                  base={ops.totalTrips}
                  active={open}
                  reduce={reduce}
                  intervalMs={5600}
                  firstDelayMs={3000}
                  deltaMin={-1}
                  deltaMax={1}
                  min={0}
                  formatValue={fmtTrips}
                  formatBump={bumpTrips}
                />
              </motion.div>

              <OverlaySection
                title="Vehicle profile"
                icon={Truck}
                iconClass="text-sky-600"
              >
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                  {[
                    ["Vehicle number", vehicleView.vehicleNumber],
                    [
                      "Registration number",
                      vehicleView.licensePlate ?? "—",
                    ],
                    ["Vehicle type", vehicleView.vehicleType ?? "—"],
                    ["Make / manufacturer", vehicleView.make ?? "—"],
                    ["Model", vehicleView.model ?? "—"],
                    ["Variant", vehicleView.variant ?? "—"],
                    [
                      "Manufacturing year",
                      vehicleView.year?.toString() ?? "—",
                    ],
                    ["Vehicle color", vehicleView.color ?? "—"],
                    ["Fuel type", vehicleView.fuelType ?? "—"],
                    ["Carbon copy / CC", vehicleView.carbonCopy ?? "—"],
                    ["Engine number", vehicleView.engineNumber ?? "—"],
                    [
                      "Chassis number",
                      vehicleView.chassisNumber ?? vehicleView.vin ?? "—",
                    ],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-500 shrink-0">{k}</span>
                      <span className="font-medium text-slate-900 text-right break-all">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </OverlaySection>

              <motion.section variants={child}>
                <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-slate-900">
                  <User size={15} className="text-violet-600" />
                  Assigned drivers
                </h3>
                <AssignedDriversBlock
                  history={vehicleView.driverHistory ?? []}
                />
              </motion.section>

              <OverlaySection
                title="Registration details"
                icon={ClipboardList}
                iconClass="text-indigo-600"
              >
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                  {[
                    [
                      "Registration date",
                      vehicleView.registrationDate ?? "—",
                    ],
                    [
                      "Registration expiry",
                      vehicleView.registrationExpiry ?? "—",
                    ],
                    [
                      "Registration authority / RTO",
                      vehicleView.registrationAuthority ?? "—",
                    ],
                    [
                      "Registration status",
                      vehicleView.registrationStatus ?? "—",
                    ],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-500 shrink-0">{k}</span>
                      <span
                        className={cn(
                          "font-medium text-right break-all",
                          k === "Registration status" &&
                            String(v).toUpperCase() === "ACTIVE"
                            ? "text-emerald-700"
                            : k === "Registration status" &&
                                String(v).toUpperCase() === "INACTIVE"
                              ? "text-slate-500"
                              : "text-slate-900",
                        )}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </OverlaySection>

              <OverlaySection
                title="Insurance & PUC compliance"
                icon={Shield}
                iconClass="text-emerald-600"
              >
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                  {[
                    [
                      "Insurance provider",
                      vehicleView.insuranceProvider ?? "—",
                    ],
                    ["Policy number", vehicleView.policyNumber ?? "—"],
                    [
                      "Insurance start date",
                      vehicleView.insuranceStartDate ?? "—",
                    ],
                    [
                      "Insurance expiry date",
                      vehicleView.insuranceExpiryDate ?? "—",
                    ],
                    [
                      "Insurance status",
                      vehicleView.insuranceStatus ?? "—",
                    ],
                    [
                      "PUC certificate number",
                      vehicleView.pucCertificateNumber ?? "—",
                    ],
                    ["PUC issue date", vehicleView.pucIssueDate ?? "—"],
                    ["PUC expiry date", vehicleView.pucExpiryDate ?? "—"],
                    [
                      "Fitness certificate",
                      vehicleView.fitnessCertificate ?? "—",
                    ],
                    ["Permit status", vehicleView.permitStatus ?? "—"],
                    ["Permit expiry", vehicleView.permitExpiry ?? "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 text-sm">
                      <span className="text-slate-500 shrink-0">{k}</span>
                      <span
                        className={cn(
                          "font-medium text-right break-all",
                          (k === "Insurance status" ||
                            k === "Permit status") &&
                            String(v).toUpperCase() === "ACTIVE"
                            ? "text-emerald-700"
                            : (k === "Insurance status" ||
                                  k === "Permit status") &&
                                ["INACTIVE", "EXPIRED"].includes(
                                  String(v).toUpperCase(),
                                )
                              ? "text-rose-600"
                              : "text-slate-900",
                        )}
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              </OverlaySection>

              <OverlaySection
                title="Alerts"
                icon={AlertCircle}
                iconClass="text-amber-600"
              >
                {complianceAlerts.length ? (
                  <ul className="space-y-2">
                    {complianceAlerts.map((a, i) => {
                      const critical = a.severity === "CRITICAL";
                      return (
                        <motion.li
                          key={a.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + i * 0.05 }}
                          className={cn(
                            "rounded-xl border px-3 py-2.5",
                            critical
                              ? "border-rose-200 bg-rose-50/80"
                              : "border-amber-200 bg-amber-50/70",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={cn(
                                "text-[11px] font-bold uppercase tracking-wide",
                                critical
                                  ? "text-rose-800"
                                  : "text-amber-800",
                              )}
                            >
                              {a.severity} · {a.label}
                            </span>
                            {a.daysLeft != null ? (
                              <span className="text-[10px] text-slate-500">
                                {a.daysLeft < 0
                                  ? `${Math.abs(a.daysLeft)}d overdue`
                                  : `${a.daysLeft}d left`}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm text-slate-800 mt-1">
                            {a.message}
                          </p>
                        </motion.li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    No document expiry alerts — registration, insurance, PUC
                    and permit look clear.
                  </p>
                )}
              </OverlaySection>

              <motion.div
                variants={child}
                className="flex flex-wrap gap-3 pb-2 pt-1"
              >
                <Link
                  href={`/dashboard/map?focus=${encodeURIComponent(vehicleView.id)}&t=${Date.now()}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
                  onClick={onClose}
                >
                  <MapPin size={15} />
                  Open live map
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
