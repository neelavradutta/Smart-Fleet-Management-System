"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  Package,
  PackageCheck,
  Truck,
  Warehouse,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/utils/cn";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type TrackData = {
  shipmentStatus: string;
  customerName: string;
  deliveryAddress: string;
  expectedDeliveryTime: string | null;
  actualDeliveryTime: string | null;
};

const STEPS = [
  { key: "CREATED", label: "Created", icon: Package },
  { key: "ASSIGNED", label: "Assigned", icon: Warehouse },
  { key: "PICKED_UP", label: "Picked up", icon: Truck },
  { key: "IN_TRANSIT", label: "In transit", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: PackageCheck },
] as const;

const panelVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 26,
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: 24,
    scale: 0.96,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
  },
};

const child = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

function formatEta(target: string | null): string {
  if (!target) return "updating…";
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return "due now";
  const mins = Math.floor(diff / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function TrackingOverlay({
  open,
  token,
  onClose,
}: {
  open: boolean;
  token: string | null;
  onClose: () => void;
}) {
  const [data, setData] = useState<TrackData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !token) return;
    let alive = true;
    setLoading(true);
    setError(null);
    setData(null);
    fetch(`${API_URL}/api/v1/track/${token}`)
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body.error ?? "Tracking not found");
        if (alive) setData(body.data);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : "Failed");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, token]);

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearInterval(id);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const idx = data ? STEPS.findIndex((s) => s.key === data.shipmentStatus) : -1;
  const pct = idx < 0 ? 0 : (idx / (STEPS.length - 1)) * 100;
  const delivered = data?.shipmentStatus === "DELIVERED";

  const eta = useMemo(
    () => formatEta(data?.expectedDeliveryTime ?? null),
    [data?.expectedDeliveryTime, tick],
  );

  const copyLink = useCallback(() => {
    if (!token) return;
    navigator.clipboard
      .writeText(`${window.location.origin}/track/${token}`)
      .then(() => toast.success("Tracking link copied"))
      .catch(() => toast.error("Copy failed"));
  }, [token]);

  return mounted
    ? createPortal(
        <AnimatePresence>
          {open ? (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 bg-white"
                onClick={onClose}
                aria-hidden
              />

              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="track-title"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[28px] bg-white border border-slate-200 shadow-[0_24px_80px_-20px_rgba(15,23,42,0.25)]"
              >
            <div
              className={cn(
                "relative px-5 sm:px-7 pt-5 pb-7 overflow-hidden",
                delivered ? "bg-emerald-500" : "bg-sky-500",
              )}
            >
              <motion.span
                aria-hidden
                animate={reduce ? {} : { x: ["-30%", "130%"] }}
                transition={{ repeat: Infinity, duration: 3.6, ease: "linear" }}
                className="pointer-events-none absolute inset-y-0 w-40 bg-white/15 blur-2xl"
              />

              <div className="relative flex items-start justify-between gap-4">
                <motion.div variants={child}>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                    <motion.span
                      animate={reduce ? {} : { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.6 }}
                      className="h-1.5 w-1.5 rounded-full bg-white"
                    />
                    {delivered ? "Completed" : "Live tracking"}
                  </span>
                  <h2
                    id="track-title"
                    className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-white"
                  >
                    {data?.customerName ?? "Shipment"}
                  </h2>
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-white/85">
                    <MapPin size={14} className="mt-0.5 shrink-0" />
                    {data?.deliveryAddress ?? "Fetching route…"}
                  </p>
                </motion.div>

                <motion.button
                  variants={child}
                  type="button"
                  whileHover={{ rotate: 90, scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  aria-label="Close tracking"
                  className="rounded-xl bg-white/20 p-2 text-white hover:bg-white/30"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <motion.div
                variants={child}
                className="relative mt-7 h-12 sm:mx-2"
              >
                <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/25" />
                <motion.div
                  className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                />
                <motion.div
                  className="absolute top-1/2 z-10"
                  initial={{ left: "0%" }}
                  animate={{ left: `${pct}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 90,
                    damping: 18,
                    delay: 0.2,
                  }}
                  style={{ translateX: "-50%", translateY: "-50%" }}
                >
                  <motion.div
                    animate={reduce ? {} : { y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                    className={cn(
                      "grid h-11 w-11 place-items-center rounded-2xl bg-white shadow-lg",
                      delivered ? "text-emerald-600" : "text-sky-600",
                    )}
                  >
                    {delivered ? <PackageCheck size={20} /> : <Truck size={20} />}
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            <div className="max-h-[calc(92vh-15rem)] overflow-y-auto sf-hide-scrollbar px-5 sm:px-7 py-6">
              {loading ? (
                <div className="grid place-items-center gap-3 py-14">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                    className="h-9 w-9 rounded-2xl border-[3px] border-sky-200 border-t-sky-500"
                  />
                  <p className="text-sm text-slate-500">Fetching live status…</p>
                </div>
              ) : null}

              {error ? (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700"
                >
                  {error}
                </motion.p>
              ) : null}

              {data ? (
                <motion.div
                  variants={panelVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6"
                >
                  <motion.div variants={child} className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                        <Clock size={13} /> ETA
                      </p>
                      <p className="mt-1 font-display text-2xl font-semibold text-amber-900">
                        {delivered ? "Arrived" : eta}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                      <p className="text-xs font-semibold text-sky-700">Stage</p>
                      <p className="mt-1 font-display text-2xl font-semibold text-sky-900">
                        {idx + 1}
                        <span className="text-base font-medium text-sky-600">
                          /{STEPS.length}
                        </span>
                      </p>
                    </div>
                  </motion.div>

                  <div>
                    <motion.p
                      variants={child}
                      className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400"
                    >
                      Journey
                    </motion.p>
                    <div className="grid gap-2">
                      {STEPS.map((step, i) => {
                        const done = i < idx;
                        const current = i === idx;
                        const Icon = step.icon;
                        return (
                          <motion.div
                            key={step.key}
                            variants={child}
                            whileHover={{ x: 4 }}
                            className={cn(
                              "flex items-center gap-3 rounded-2xl border p-3 transition-colors",
                              current
                                ? delivered
                                  ? "border-emerald-300 bg-emerald-50"
                                  : "border-sky-300 bg-sky-50"
                                : done
                                  ? "border-emerald-100 bg-emerald-50/50"
                                  : "border-slate-100 bg-slate-50/60",
                            )}
                          >
                            <div className="relative shrink-0">
                              {current && !reduce ? (
                                <motion.span
                                  animate={{ scale: [1, 1.7], opacity: [0.55, 0] }}
                                  transition={{ repeat: Infinity, duration: 1.7 }}
                                  className={cn(
                                    "absolute inset-0 rounded-xl",
                                    delivered ? "bg-emerald-400" : "bg-sky-400",
                                  )}
                                />
                              ) : null}
                              <div
                                className={cn(
                                  "relative grid h-10 w-10 place-items-center rounded-xl",
                                  current
                                    ? delivered
                                      ? "bg-emerald-500 text-white"
                                      : "bg-sky-500 text-white"
                                    : done
                                      ? "bg-emerald-500 text-white"
                                      : "bg-white text-slate-400 border border-slate-200",
                                )}
                              >
                                {done ? (
                                  <Check size={17} strokeWidth={3} />
                                ) : (
                                  <Icon size={17} />
                                )}
                              </div>
                            </div>
                            <p
                              className={cn(
                                "flex-1 text-sm font-semibold",
                                done || current ? "text-slate-900" : "text-slate-400",
                              )}
                            >
                              {step.label}
                            </p>
                            {current ? (
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white",
                                  delivered ? "bg-emerald-500" : "bg-sky-500",
                                )}
                              >
                                {delivered ? "Done" : "Now"}
                              </span>
                            ) : null}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <motion.div variants={child} className="flex flex-wrap gap-2">
                    <motion.button
                      type="button"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={copyLink}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Copy size={15} /> Copy link
                    </motion.button>
                    <motion.a
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      href={`/track/${token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
                    >
                      <ExternalLink size={15} /> Public page
                    </motion.a>
                  </motion.div>
                </motion.div>
              ) : null}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
        document.body,
      )
    : null;
}
