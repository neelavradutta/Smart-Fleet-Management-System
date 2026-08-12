"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useReducedMotion } from "framer-motion";
import { Gauge, MapPin, Navigation, Plus, Route, Search } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { LiveMetricTile } from "@/components/common/LiveMetricTile";
import { PageHero } from "@/components/common/PageHero";
import { NewRouteFormOverlay } from "@/components/routes/NewRouteFormOverlay";
import { RouteDetailsOverlay } from "@/components/routes/RouteDetailsOverlay";
import { RouteRunBoard } from "@/components/routes/RouteRunBoard";
import {
  fmtKm,
  fmtScore,
  isRouteDelayed,
  ROUTE_STATUS,
  type RouteDetails,
} from "@/components/routes/types";

export default function RoutesPage() {
  const [rows, setRows] = useState<RouteDetails[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<RouteDetails | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    api<{ data: RouteDetails[] }>("/api/v1/routes")
      .then((res) => setRows(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";
    const socket = io(url, { transports: ["websocket", "polling"] });
    const onUpdate = (row: RouteDetails) => {
      setRows((prev) => {
        const i = prev.findIndex((r) => r.id === row.id);
        if (i === -1) return [row, ...prev];
        const next = [...prev];
        next[i] = row;
        return next;
      });
      setSelected((sel) => (sel && sel.id === row.id ? row : sel));
    };
    socket.on("route_update", onUpdate);
    return () => {
      socket.off("route_update", onUpdate);
      socket.disconnect();
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const blob = [
        r.code,
        r.name,
        r.corridor,
        r.vehicleNumber,
        r.driverName,
        r.routeStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [rows, search]);

  const metrics = useMemo(() => {
    const active = rows.filter((r) => r.routeStatus === "ACTIVE");
    const open = rows.filter(
      (r) => r.routeStatus === "ACTIVE" || r.routeStatus === "PLANNED",
    );
    const stopsLeft = open.reduce(
      (s, r) => s + Math.max(0, r.totalStops - r.completedStops),
      0,
    );
    const plannedKm = rows.reduce((s, r) => s + Number(r.plannedDistanceKm ?? 0), 0);
    const scored = rows.filter((r) => r.optimizationScore != null);
    const avgOpt =
      scored.length === 0
        ? 0
        : scored.reduce((s, r) => s + Number(r.optimizationScore), 0) /
          scored.length;
    return {
      active: active.length,
      stopsLeft,
      plannedKm: Math.round(plannedKm),
      avgOpt,
    };
  }, [rows]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 [&>*]:!mb-0">
      <PageHero
        theme="tan"
        title="Route optimizer"
        subtitle="Multi-stop VRP — OR-Tools or nearest-neighbor fallback."
      />

      <div className="grid shrink-0 grid-cols-2 sm:grid-cols-4 gap-3">
        <LiveMetricTile
          label="Active routes"
          icon={Navigation}
          iconTint="bg-tan-100 text-tan-700"
          bumpClass="bg-tan-700"
          bumpDownClass="bg-tan-800"
          base={metrics.active}
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
          label="Stops remaining"
          icon={MapPin}
          iconTint="bg-tan-100 text-tan-700"
          bumpClass="bg-tan-700"
          bumpDownClass="bg-tan-800"
          base={metrics.stopsLeft}
          active
          reduce={reduce}
          intervalMs={5600}
          firstDelayMs={3000}
          deltaMin={-1}
          deltaMax={2}
          min={0}
          formatValue={(n) => String(n)}
          formatBump={(d) => `${d > 0 ? "+" : ""}${d}`}
        />
        <LiveMetricTile
          label="Planned km"
          icon={Route}
          iconTint="bg-tan-100 text-tan-700"
          bumpClass="bg-tan-700"
          bumpDownClass="bg-tan-800"
          base={metrics.plannedKm}
          active
          reduce={reduce}
          intervalMs={5000}
          firstDelayMs={2400}
          deltaMin={-4}
          deltaMax={8}
          min={0}
          formatValue={(n) => n.toLocaleString("en-IN")}
          formatBump={(d) => `${d > 0 ? "+" : ""}${d}`}
        />
        <LiveMetricTile
          label="Avg optimization"
          icon={Gauge}
          iconTint="bg-tan-100 text-tan-700"
          bumpClass="bg-tan-700"
          bumpDownClass="bg-tan-800"
          base={metrics.avgOpt}
          active
          reduce={reduce}
          intervalMs={5200}
          firstDelayMs={2600}
          deltaMin={-1}
          deltaMax={1}
          min={0}
          max={100}
          formatValue={(n) => fmtScore(n)}
          formatBump={(d) => `${d > 0 ? "+" : ""}${d}`}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-12 xl:grid-rows-[minmax(0,1fr)] gap-4 items-stretch overflow-hidden">
        <div className="xl:col-span-8 min-h-0 h-full min-w-0">
          <Card
            accent="tan"
            className="h-full min-w-0 flex flex-col overflow-hidden"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <h2 className="font-display text-xl font-semibold text-slate-900">
                Route board
              </h2>
              <div className="ml-auto flex items-center gap-2">
                <label className="relative inline-flex items-center">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 text-tan-700/70"
                    aria-hidden
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search code, corridor, driver…"
                    aria-label="Search routes"
                    size={28}
                    className="w-auto max-w-full rounded-xl border-tan-200 bg-tan-50/50 pl-9 text-sm focus:border-tan-400 focus:ring-tan-400"
                  />
                </label>
                <Button
                  size="sm"
                  variant="tan"
                  className="rounded-full px-4 py-2 font-semibold tracking-tight"
                  onClick={() => setNewOpen(true)}
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
                    <Plus size={13} strokeWidth={2.5} />
                  </span>
                  New route
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-[1.4fr_1.2fr_0.55fr_0.7fr_0.85fr] gap-2 border-b-2 border-slate-800 pb-2 text-sm text-slate-500 shrink-0">
              <span className="font-medium">Route</span>
              <span className="font-medium">Assignment</span>
              <span className="font-medium">Stops</span>
              <span className="font-medium">Distance</span>
              <span className="font-medium">Status</span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain sf-hide-scrollbar">
              {filtered.map((r) => {
                const meta =
                  ROUTE_STATUS[r.routeStatus] ?? {
                    label: r.routeStatus,
                    tone: "neutral" as const,
                  };
                const delayed = isRouteDelayed(r);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelected(r)}
                    className="grid shrink-0 grid-cols-[1.4fr_1.2fr_0.55fr_0.7fr_0.85fr] items-center gap-2 py-3 border-b border-slate-50 last:border-0 text-left w-full rounded-lg px-1 -mx-1 hover:bg-tan-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tan-300"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {r.code} · {r.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{r.corridor}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700 truncate">
                        {r.vehicleNumber ?? "—"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {r.driverName ?? "Unassigned"}
                      </p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">
                      {r.completedStops}/{r.totalStops}
                    </p>
                    <p className="text-sm text-slate-700 tabular-nums">
                      {fmtKm(r.plannedDistanceKm)}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <Badge tone={delayed ? "warning" : meta.tone}>
                        {delayed ? "Delayed" : meta.label}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
        <div className="xl:col-span-4 min-h-0 h-full overflow-hidden">
          <RouteRunBoard routes={rows} onSelect={setSelected} />
        </div>
      </div>

      <NewRouteFormOverlay
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(row) => setRows((prev) => [row, ...prev])}
      />
      <RouteDetailsOverlay
        open={Boolean(selected)}
        route={selected}
        onClose={() => setSelected(null)}
        onPatched={(row) => {
          setRows((prev) => prev.map((r) => (r.id === row.id ? row : r)));
          setSelected(row);
        }}
      />
    </div>
  );
}
