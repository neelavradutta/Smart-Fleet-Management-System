"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Radio, Search, X } from "lucide-react";
import { cn } from "@/utils/cn";
import type { MapVehicle } from "@/components/dashboard/VehicleMap";

const STATUS_META = {
  active: {
    label: "Live",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
    text: "text-emerald-700",
    track: "bg-emerald-100",
    bar: "bg-emerald-500",
  },
  idle: {
    label: "Idle",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
    text: "text-amber-700",
    track: "bg-amber-100",
    bar: "bg-amber-500",
  },
  offline: {
    label: "Off",
    dot: "bg-slate-400",
    ring: "ring-slate-200",
    text: "text-slate-500",
    track: "bg-slate-100",
    bar: "bg-slate-400",
  },
} as const;

type Filter = "all" | "active" | "idle" | "offline";

export function FleetSidePanel({
  vehicles,
  focusId,
  onFocus,
  connected,
}: {
  vehicles: MapVehicle[];
  focusId: string | null;
  onFocus: (id: string | null) => void;
  connected: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    return vehicles.reduce(
      (acc, v) => {
        const s = v.status ?? "offline";
        acc[s] = (acc[s] ?? 0) + 1;
        acc.all += 1;
        return acc;
      },
      { all: 0, active: 0, idle: 0, offline: 0 } as Record<Filter, number>,
    );
  }, [vehicles]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (filter !== "all" && (v.status ?? "offline") !== filter) return false;
      if (q && !v.label.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [vehicles, filter, query]);

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Live" },
    { id: "idle", label: "Idle" },
    { id: "offline", label: "Off" },
  ];

  return (
    <div className="flex h-full min-h-[280px] flex-col rounded-2xl border border-slate-200/80 bg-white shadow-card overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-slate-900">
              Fleet
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tap unit → map flies
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
              connected
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700",
            )}
          >
            <Radio size={11} className={connected ? "animate-pulse" : ""} />
            {connected ? "WS" : "…"}
          </span>
        </div>

        <label className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 focus-within:border-sky-300 focus-within:bg-white transition-colors">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find vehicle"
            className="w-full bg-transparent border-0 p-0 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-0"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          ) : null}
        </label>

        <LayoutGroup id="fleet-filters">
          <div className="mt-3 flex gap-1.5">
            {filters.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "relative flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-colors",
                    active ? "text-sky-800" : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="fleet-filter-pill"
                      className="absolute inset-0 rounded-lg bg-sky-100"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                  <span className="relative z-10">
                    {f.label}
                    <span className="ml-1 opacity-60">{counts[f.id]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      <div className="flex-1 overflow-y-auto sf-hide-scrollbar px-2 py-2 max-h-[520px]">
        <AnimatePresence mode="popLayout" initial={false}>
          {rows.length === 0 ? (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center text-sm text-slate-400"
            >
              No matches
            </motion.p>
          ) : (
            <LayoutGroup id="fleet-rows">
              <ul className="space-y-1">
                {rows.map((v, i) => {
                  const status = v.status ?? "offline";
                  const meta = STATUS_META[status];
                  const selected = focusId === v.id;
                  const speed = Math.min(120, Math.max(0, v.speed ?? 0));
                  const speedPct = (speed / 120) * 100;

                  return (
                    <motion.li
                      key={v.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: Math.min(i * 0.03, 0.2) }}
                    >
                      <motion.button
                        type="button"
                        layout
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => onFocus(selected ? null : v.id)}
                        className={cn(
                          "group relative w-full overflow-hidden rounded-xl px-3 py-3 text-left transition-colors",
                          selected
                            ? "bg-sky-50"
                            : "hover:bg-slate-50",
                        )}
                      >
                        {selected ? (
                          <motion.span
                            layoutId="fleet-active-bar"
                            className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-sky-500"
                            transition={{ type: "spring", stiffness: 400, damping: 28 }}
                          />
                        ) : null}

                        <div className="flex items-start gap-3">
                          <div className="relative mt-0.5 shrink-0">
                            {status === "active" ? (
                              <motion.span
                                animate={{ scale: [1, 1.8], opacity: [0.45, 0] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 1.8,
                                  ease: "easeOut",
                                }}
                                className={cn(
                                  "absolute inset-0 rounded-full",
                                  meta.dot,
                                )}
                              />
                            ) : null}
                            <span
                              className={cn(
                                "relative block h-2.5 w-2.5 rounded-full ring-4",
                                meta.dot,
                                meta.ring,
                              )}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate font-semibold text-sm text-slate-900 tracking-tight">
                                {v.label}
                              </p>
                              <span
                                className={cn(
                                  "text-[10px] font-bold uppercase tracking-wider",
                                  meta.text,
                                )}
                              >
                                {meta.label}
                              </span>
                            </div>

                            <div className="mt-2 flex items-center gap-2">
                              <div
                                className={cn(
                                  "h-1 flex-1 overflow-hidden rounded-full",
                                  meta.track,
                                )}
                              >
                                <motion.div
                                  className={cn("h-full rounded-full", meta.bar)}
                                  animate={{ width: `${speedPct}%` }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 120,
                                    damping: 20,
                                  }}
                                />
                              </div>
                              <span className="tabular-nums text-[11px] font-semibold text-slate-600 w-12 text-right">
                                {Math.round(speed)}
                                <span className="text-slate-400 font-medium">
                                  {" "}
                                  km
                                </span>
                              </span>
                            </div>

                            <AnimatePresence>
                              {selected ? (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 text-[11px] text-slate-400 overflow-hidden"
                                >
                                  {v.latitude.toFixed(4)}, {v.longitude.toFixed(4)} ·
                                  tap again to clear
                                </motion.p>
                              ) : null}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.button>
                    </motion.li>
                  );
                })}
              </ul>
            </LayoutGroup>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
