"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { api } from "@/lib/api";
import { cn } from "@/utils/cn";

export type AlertItem = {
  id: string;
  alertType: string;
  alertSeverity: string;
  alertMessage: string;
  isResolved: boolean;
};

export function isGeofenceAlert(a: AlertItem) {
  const type = (a.alertType ?? "").toUpperCase();
  const msg = a.alertMessage ?? "";
  return (
    type.includes("GEOFENCE") ||
    /geofence|restricted zone/i.test(msg)
  );
}

type AlertChrome = {
  card: string;
  bar: string;
  badgeTone: "success" | "warning" | "danger" | "info" | "neutral";
  badgeClass?: string;
  typeClass: string;
  buttonVariant: "danger" | "primary" | "lilac" | "tan" | "success";
  buttonClass?: string;
};

const CRITICAL_CHROME: AlertChrome = {
  card: "rounded-xl border border-slate-200 bg-slate-100 p-3",
  bar: "bg-red-600",
  badgeTone: "danger",
  badgeClass: "!bg-red-600 !text-white !border-red-600",
  typeClass: "text-xs text-slate-600",
  buttonVariant: "success",
};

const WARNING_CHROME: AlertChrome = {
  card: "rounded-xl border border-yellow-300 bg-yellow-100 p-3",
  bar: "bg-amber-600",
  badgeTone: "warning",
  badgeClass: "!bg-amber-300 !text-amber-950 !border-amber-400",
  typeClass: "text-xs text-amber-950",
  buttonVariant: "tan",
  buttonClass:
    "!bg-amber-600 hover:!bg-amber-700 !shadow-none !border-amber-600 !text-white",
};

const INFO_CHROME: AlertChrome = {
  card: "rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50/80 p-3",
  bar: "bg-sky-500",
  badgeTone: "info",
  typeClass: "text-xs text-sky-700",
  buttonVariant: "primary",
};

function alertChrome(a: AlertItem): AlertChrome {
  const type = (a.alertType ?? "").toUpperCase();
  const sev = (a.alertSeverity ?? "").toUpperCase();

  if (type.includes("BREAKDOWN") || sev === "CRITICAL") {
    return CRITICAL_CHROME;
  }
  if (sev === "WARNING") {
    return WARNING_CHROME;
  }
  return INFO_CHROME;
}

function openAlerts(list: AlertItem[]) {
  return list.filter((a) => !isGeofenceAlert(a) && !a.isResolved);
}

function ResolveSpinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      aria-hidden
      className="animate-spin origin-center"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.4"
        opacity="0.28"
      />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="16 42"
      />
    </svg>
  );
}

function GreenTick() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 18 }}
    >
      <motion.circle
        cx="12"
        cy="12"
        r="10"
        fill="#22c55e"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 480, damping: 16 }}
      />
      <motion.path
        d="M7 12.2l3.2 3.2L17.2 8.5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
      />
    </motion.svg>
  );
}

export function AlertsPanel({
  alerts,
  onResolved,
  className,
  showOpenCount = true,
  listKey = "list",
}: {
  alerts: AlertItem[];
  onResolved?: () => void;
  className?: string;
  showOpenCount?: boolean;
  listKey?: string;
}) {
  const [local, setLocal] = useState(() => openAlerts(alerts));
  const [phase, setPhase] = useState<Record<string, "spin" | "done">>({});
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const timers = useRef<number[]>([]);

  const incoming = openAlerts(alerts);
  const incomingRef = useRef(incoming);
  incomingRef.current = incoming;
  const resolving = Object.keys(phase).length > 0;
  const visible = resolving ? local : incoming;

  useEffect(() => {
    if (resolving) return;
    setLocal(openAlerts(alerts));
  }, [alerts, resolving]);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  const resolveAlert = (id: string) => {
    if (phaseRef.current[id]) return;
    setLocal(incomingRef.current);
    setPhase((prev) => ({ ...prev, [id]: "spin" }));
    const started = Date.now();
    api(`/api/v1/alerts/${id}/resolve`, { method: "PATCH" })
      .then(() => {
        const wait = Math.max(0, 2000 - (Date.now() - started));
        const toDone = window.setTimeout(() => {
          setPhase((prev) => ({ ...prev, [id]: "done" }));
          const hide = window.setTimeout(() => {
            setLocal((prev) => prev.filter((row) => row.id !== id));
            const sync = window.setTimeout(() => {
              setPhase((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
              });
              onResolved?.();
            }, 1350);
            timers.current.push(sync);
          }, 1000);
          timers.current.push(hide);
        }, wait);
        timers.current.push(toDone);
      })
      .catch(() => {
        setPhase((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      });
  };

  return (
    <Card accent="coral" className={cn("h-full min-h-[380px] flex flex-col", className)}>
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <motion.div
          animate={{ rotate: [0, -12, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        >
          <Bell className="text-rose-500" size={18} />
        </motion.div>
        <h3 className="font-display text-lg font-semibold text-slate-900">
          Monitoring
        </h3>
        {showOpenCount ? (
          <Badge tone="danger" pulse className="ml-auto">
            {visible.filter((a) => !phase[a.id]).length} open
          </Badge>
        ) : null}
      </div>
      <motion.div
        className="overflow-y-auto flex-1 min-h-0 pr-1 sf-hide-scrollbar"
        layoutScroll
      >
        {visible.length === 0 && Object.keys(phase).length === 0 ? (
          <p className="text-sm text-slate-500">No alerts — fleet calm.</p>
        ) : (
          <div className="flex flex-col gap-3 pt-2 pb-1">
            <AnimatePresence initial={false}>
              {visible.map((a) => {
                const chrome = alertChrome(a);
                const status = phase[a.id];
                const busy = Boolean(status);
                return (
                  <motion.div
                    key={a.id}
                    layout
                    initial={false}
                    exit={
                      resolving
                        ? {
                            x: "80%",
                            opacity: 0,
                            filter: "blur(6px)",
                            transition: {
                              x: {
                                duration: 0.9,
                                ease: [0.22, 0.61, 0.36, 1],
                              },
                              filter: {
                                duration: 0.7,
                                delay: 0.2,
                                ease: "easeOut",
                              },
                              opacity: {
                                duration: 0.7,
                                delay: 0.22,
                                ease: [0.4, 0, 1, 1],
                              },
                            },
                          }
                        : {
                            opacity: 0,
                            transition: { duration: 0.12 },
                          }
                    }
                    transition={{
                      layout: {
                        type: "tween",
                        duration: resolving ? 0.45 : 0.22,
                        ease: [0.4, 0, 0.2, 1],
                      },
                    }}
                    className="group relative"
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden",
                        !busy &&
                          !resolving &&
                          "transition-transform duration-200 ease-out group-hover:-translate-y-1",
                        chrome.card,
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute top-0 left-0 z-10 h-[3px] w-0 rounded-r-full transition-[width] duration-200 ease-out group-hover:w-full",
                          chrome.bar,
                        )}
                      />
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          tone={chrome.badgeTone}
                          className={chrome.badgeClass}
                        >
                          {a.alertSeverity}
                        </Badge>
                        <span className={chrome.typeClass}>{a.alertType}</span>
                      </div>
                      <p className="text-sm text-slate-800 mb-2">
                        {a.alertMessage}
                      </p>
                      <Button
                        size="sm"
                        variant={chrome.buttonVariant}
                        className={cn(
                          chrome.buttonClass,
                          busy && "disabled:opacity-100 disabled:cursor-default",
                        )}
                        disabled={busy}
                        onClick={() => resolveAlert(a.id)}
                      >
                        {status ? (
                          <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center">
                            <AnimatePresence mode="wait" initial={false}>
                              {status === "spin" ? (
                                <motion.span
                                  key="spin"
                                  className="inline-flex"
                                  initial={{ opacity: 0, scale: 0.6 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.6 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <ResolveSpinner />
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="tick"
                                  className="inline-flex"
                                  initial={{ opacity: 0, scale: 0.6 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.6 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <GreenTick />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </span>
                        ) : null}
                        {status === "done" ? "Resolved" : "Resolve"}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </Card>
  );
}
