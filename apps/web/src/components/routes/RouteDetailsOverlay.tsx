"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  ChevronDown,
  Gauge,
  MapPin,
  Navigation,
  Truck,
  X,
} from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { api } from "@/lib/api";
import {
  fmtKm,
  fmtMins,
  fmtScore,
  fmtWhen,
  isRouteDelayed,
  ROUTE_STATUS,
  ROUTE_TYPE,
  STOP_STATUS,
  type RouteDetails,
} from "@/components/routes/types";

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
    },
  },
  exit: {
    opacity: 0,
    y: 28,
    scale: 0.96,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
  },
};

function OverlaySection({
  title,
  icon: Icon,
  iconClass,
  children,
}: {
  title: string;
  icon: LucideIcon;
  iconClass: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section>
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
    </section>
  );
}

function FieldGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      {rows.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-0.5 text-sm font-medium text-slate-900 truncate">
            {value || "—"}
          </p>
        </div>
      ))}
    </div>
  );
}

export function RouteDetailsOverlay({
  open,
  route,
  onClose,
  onPatched,
}: {
  open: boolean;
  route: RouteDetails | null;
  onClose: () => void;
  onPatched?: (row: RouteDetails) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

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

  async function setStatus(routeStatus: string) {
    if (!route) return;
    try {
      const res = await api<{ data: RouteDetails }>(`/api/v1/routes/${route.id}`, {
        method: "PATCH",
        body: JSON.stringify({ routeStatus }),
      });
      onPatched?.(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  if (!mounted) return null;
  const r = route;
  const delayed = r ? isRouteDelayed(r) : false;
  const meta = r
    ? (ROUTE_STATUS[r.routeStatus] ?? { label: r.routeStatus, tone: "neutral" as const })
    : null;

  return createPortal(
    <AnimatePresence>
      {open && r && meta ? (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="route-detail-title"
            variants={reduce ? undefined : panelVariants}
            initial={reduce ? false : "hidden"}
            animate="visible"
            exit="exit"
            onMouseDown={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-t-[28px] sm:rounded-[28px] bg-white border border-slate-200 shadow-[0_28px_90px_-24px_rgba(15,23,42,0.4)]"
          >
            <div className="relative bg-tan-700 px-5 sm:px-7 pt-5 pb-6">
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={meta.tone} className="bg-white/95">
                      {meta.label}
                    </Badge>
                    {delayed ? (
                      <Badge tone="warning" className="bg-white/95">
                        Delayed
                      </Badge>
                    ) : null}
                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                      {ROUTE_TYPE[r.routeType] ?? r.routeType}
                    </span>
                  </div>
                  <h2
                    id="route-detail-title"
                    className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-white truncate"
                  >
                    {r.code} · {r.name}
                  </h2>
                  <p className="mt-1 text-sm text-white/90">{r.corridor}</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close route details"
                  className="shrink-0 grid place-items-center h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(92vh-8.5rem)] px-5 sm:px-7 py-5 space-y-5 sf-hide-scrollbar">
              <OverlaySection
                title="Route details"
                icon={Navigation}
                iconClass="text-tan-700"
              >
                <FieldGrid
                  rows={[
                    ["Code", r.code],
                    ["Name", r.name],
                    ["Type", ROUTE_TYPE[r.routeType] ?? r.routeType],
                    ["Corridor", r.corridor],
                    ["Status", meta.label],
                    ["Depot", r.depot ?? "—"],
                  ]}
                />
                <label className="mt-3 block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Update status
                  </span>
                  <select
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-tan-400 focus:outline-none focus:ring-2 focus:ring-tan-200"
                    value={r.routeStatus}
                    onChange={(e) => void setStatus(e.target.value)}
                  >
                    {Object.keys(ROUTE_STATUS).map((s) => (
                      <option key={s} value={s}>
                        {ROUTE_STATUS[s].label}
                      </option>
                    ))}
                  </select>
                </label>
              </OverlaySection>

              <OverlaySection
                title="Assignment"
                icon={Truck}
                iconClass="text-tan-700"
              >
                <FieldGrid
                  rows={[
                    ["Vehicle", r.vehicleNumber ?? "—"],
                    ["Registration", r.licensePlate ?? "—"],
                    ["Driver", r.driverName ?? "—"],
                    ["Driver ID", r.driverCode ?? "—"],
                    ["Depot", r.depot ?? "—"],
                    ["Created", fmtWhen(r.createdAt)],
                  ]}
                />
              </OverlaySection>

              <OverlaySection
                title="Schedule"
                icon={CalendarClock}
                iconClass="text-tan-700"
              >
                <FieldGrid
                  rows={[
                    ["Planned start", fmtWhen(r.plannedStartTime)],
                    ["Actual start", fmtWhen(r.actualStartTime)],
                    ["Planned end", fmtWhen(r.plannedEndTime)],
                    ["Actual end", fmtWhen(r.actualEndTime)],
                    ["Planned duration", fmtMins(r.plannedDurationMinutes)],
                    ["Actual duration", fmtMins(r.actualDurationMinutes)],
                  ]}
                />
              </OverlaySection>

              <OverlaySection
                title="Performance"
                icon={Gauge}
                iconClass="text-tan-700"
              >
                <FieldGrid
                  rows={[
                    ["Planned km", fmtKm(r.plannedDistanceKm)],
                    ["Actual km", fmtKm(r.actualDistanceKm)],
                    ["Optimization", fmtScore(r.optimizationScore)],
                    ["Efficiency", fmtScore(r.efficiencyScore)],
                    ["CO₂ kg", fmtKm(r.co2Kg)],
                    ["Stops", `${r.completedStops}/${r.totalStops}`],
                  ]}
                />
              </OverlaySection>

              <OverlaySection
                title="Stops"
                icon={MapPin}
                iconClass="text-tan-700"
              >
                <ol className="space-y-2 rounded-2xl border border-slate-200 bg-white p-3">
                  {(r.stops ?? []).map((stop) => {
                    const st =
                      STOP_STATUS[stop.status] ?? {
                        label: stop.status,
                        tone: "neutral" as const,
                      };
                    return (
                      <li
                        key={stop.id}
                        className="flex items-start gap-3 rounded-xl border border-slate-100 px-3 py-2.5"
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-tan-100 text-xs font-bold text-tan-700">
                          {stop.seq}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {stop.label}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {stop.address || `${stop.lat.toFixed(3)}, ${stop.lng.toFixed(3)}`}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <Badge tone={st.tone}>{st.label}</Badge>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {fmtWhen(stop.eta)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </OverlaySection>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
