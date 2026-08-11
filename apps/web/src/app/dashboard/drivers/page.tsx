"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useReducedMotion } from "framer-motion";
import { Gauge, Navigation, Route, Search, Users } from "lucide-react";
import { api } from "@/lib/api";
import { mergeDriver } from "@/lib/driverMetrics";
import { DriverLeaderboard } from "@/components/drivers/DriverLeaderboard";
import {
  DriverDetailsOverlay,
  DRIVER_STATUS,
  hydrateDriver,
  type DriverDetails,
} from "@/components/drivers/DriverDetailsOverlay";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { LiveMetricTile } from "@/components/common/LiveMetricTile";
import { PageHero } from "@/components/common/PageHero";


export default function DriversPage() {
  const [rows, setRows] = useState<DriverDetails[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DriverDetails | null>(null);

  useEffect(() => {
    api<{ data: DriverDetails[] }>("/api/v1/drivers")
      .then((res) => setRows(res.data.map(hydrateDriver)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";
    const socket = io(url, { transports: ["websocket", "polling"] });
    const onUpdate = (row: DriverDetails) => {
      const next = hydrateDriver(row);
      setRows((prev) =>
        prev.map((d) => (d.id === next.id ? mergeDriver(d, next) : d)),
      );
      setSelected((sel) =>
        sel && sel.id === next.id ? mergeDriver(sel, next) : sel,
      );
    };
    socket.on("driver_update", onUpdate);
    return () => {
      socket.off("driver_update", onUpdate);
      socket.disconnect();
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((d) => (d.fullName ?? "").toLowerCase().includes(q));
  }, [rows, search]);

  const reduce = useReducedMotion();
  const metrics = useMemo(() => {
    const current = rows.filter((d) => d.status !== "OFFBOARDED");
    const miles = current.reduce((s, d) => s + (d.totalMiles ?? 0), 0);
    const avg =
      current.length === 0
        ? 0
        : current.reduce((s, d) => s + Number(d.safetyScore), 0) /
          current.length;
    const tripsToday = current.reduce((s, d) => {
      if (typeof d.tripsToday === "number") return s + d.tripsToday;
      if (d.status === "ON_DUTY" || d.status === "ACTIVE") return s + 8;
      if (d.status === "OFF_DUTY" || d.status === "INACTIVE") return s + 3;
      return s;
    }, 0);
    return {
      totalDrivers: current.length,
      tripsToday,
      totalMiles: miles,
      avgSafety: avg,
    };
  }, [rows]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 [&>*]:!mb-0">
      <PageHero
        theme="lilac"
        title="Driver performance"
        subtitle="Safety scores, licenses, and behavior monitoring."
      />

      <div className="grid shrink-0 grid-cols-2 sm:grid-cols-4 gap-3">
        <LiveMetricTile
          label="Total Drivers"
          icon={Users}
          iconTint="bg-violet-50 text-violet-600"
          bumpClass="bg-violet-500"
          bumpDownClass="bg-violet-700"
          base={metrics.totalDrivers}
          active
          reduce={reduce}
          intervalMs={6400}
          firstDelayMs={2800}
          deltaMin={-1}
          deltaMax={1}
          min={0}
          formatValue={(n) => String(n)}
          formatBump={(d) => `${d > 0 ? "+" : ""}${d}`}
        />
        <LiveMetricTile
          label="Trips Today"
          icon={Navigation}
          iconTint="bg-emerald-50 text-emerald-600"
          bumpClass="bg-emerald-500"
          bumpDownClass="bg-emerald-700"
          base={metrics.tripsToday}
          active
          reduce={reduce}
          intervalMs={5600}
          firstDelayMs={3000}
          deltaMin={-1}
          deltaMax={1}
          min={0}
          formatValue={(n) => String(n)}
          formatBump={(d) => `${d > 0 ? "+" : ""}${d}`}
        />
        <LiveMetricTile
          label="Total Miles"
          icon={Route}
          iconTint="bg-sky-50 text-sky-600"
          bumpClass="bg-sky-500"
          bumpDownClass="bg-sky-700"
          base={metrics.totalMiles}
          active
          reduce={reduce}
          intervalMs={5000}
          firstDelayMs={2400}
          deltaMin={-3}
          deltaMax={8}
          min={0}
          formatValue={(n) => `${n.toLocaleString("en-IN")} mi`}
          formatBump={(d) => `${d > 0 ? "+" : ""}${d} mi`}
        />
        <LiveMetricTile
          label="Average Safety Score"
          icon={Gauge}
          iconTint="bg-rose-50 text-rose-600"
          bumpClass="bg-rose-500"
          bumpDownClass="bg-rose-700"
          base={metrics.avgSafety}
          active
          reduce={reduce}
          intervalMs={5200}
          firstDelayMs={2600}
          deltaMin={-1}
          deltaMax={1}
          min={0}
          max={100}
          formatValue={(n) => `${n}`}
          formatBump={(d) => `${d > 0 ? "+" : ""}${d}`}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-12 xl:grid-rows-[minmax(0,1fr)] gap-4 items-stretch overflow-hidden">
        <Card
          accent="lilac"
          className="xl:col-span-8 min-h-0 h-full min-w-0 flex flex-col overflow-hidden"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Roster
            </h2>
            <label className="relative ml-auto inline-flex items-center">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 text-violet-600/70"
                aria-hidden
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name…"
                aria-label="Search drivers by name"
                size={28}
                className="w-auto max-w-full rounded-xl border-violet-200 bg-violet-50/50 pl-9 text-sm focus:border-violet-400 focus:ring-violet-400"
              />
            </label>
          </div>
          <div className="grid grid-cols-[1.4fr_1.1fr_0.55fr_0.9fr] gap-2 border-b border-slate-100 pb-2 text-sm text-slate-500 shrink-0">
            <span className="font-medium">Name</span>
            <span className="font-medium">License</span>
            <span className="font-medium">Safety</span>
            <span className="font-medium">Status</span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain sf-hide-scrollbar">
            {filtered.map((d) => {
              const meta =
                DRIVER_STATUS[d.status] ?? {
                  label: d.status,
                  tone: "neutral" as const,
                };
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelected(d)}
                  className="grid shrink-0 grid-cols-[1.4fr_1.1fr_0.55fr_0.9fr] items-center gap-2 py-3 border-b border-slate-50 last:border-0 text-left w-full rounded-lg px-1 -mx-1 hover:bg-violet-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {d.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{d.email}</p>
                  </div>
                  <p className="text-sm text-slate-700 truncate">
                    {d.licenseNumber}
                  </p>
                  <p className="text-sm font-semibold">
                    {Number(d.safetyScore).toFixed(1)}
                  </p>
                  <div>
                    <Badge tone={meta.tone}>{meta.label}</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
        <div className="xl:col-span-4 min-h-0 h-full overflow-hidden">
          <DriverLeaderboard drivers={rows} />
        </div>
      </div>

      <DriverDetailsOverlay
        open={Boolean(selected)}
        driver={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
