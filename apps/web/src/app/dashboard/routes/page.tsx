"use client";

import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useReducedMotion } from "framer-motion";
import { CalendarClock, Navigation, Plus, Route, Search } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { LiveMetricTile } from "@/components/common/LiveMetricTile";
import { PageHero } from "@/components/common/PageHero";
import { NewRouteFormOverlay } from "@/components/routes/NewRouteFormOverlay";
import { RouteDetailsOverlay } from "@/components/routes/RouteDetailsOverlay";
import {
  fmtKm,
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
    const active = rows.filter((r) => r.routeStatus === "ACTIVE").length;
    const upcoming = rows.filter((r) => r.routeStatus === "PLANNED").length;
    return {
      total: rows.length,
      active,
      upcoming,
    };
  }, [rows]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 [&>*]:!mb-0">
      <PageHero
        theme="tan"
        title="Route optimizer"
        subtitle="Multi-stop VRP — OR-Tools or nearest-neighbor fallback."
      />

      <div className="grid shrink-0 grid-cols-3 gap-3">
        <LiveMetricTile
          label="Total routes"
          icon={Route}
          iconTint="bg-tan-100 text-tan-700"
          bumpClass="bg-tan-700"
          bumpDownClass="bg-tan-800"
          base={metrics.total}
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
          label="Active routes"
          icon={Navigation}
          iconTint="bg-emerald-50 text-emerald-600"
          bumpClass="bg-emerald-500"
          bumpDownClass="bg-emerald-700"
          base={metrics.active}
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
          label="Upcoming routes"
          icon={CalendarClock}
          iconTint="bg-sky-50 text-sky-600"
          bumpClass="bg-sky-500"
          bumpDownClass="bg-sky-700"
          base={metrics.upcoming}
          active
          reduce={reduce}
          intervalMs={5200}
          firstDelayMs={2600}
          deltaMin={-1}
          deltaMax={1}
          min={0}
          formatValue={(n) => String(n)}
          formatBump={(d) => `${d > 0 ? "+" : ""}${d}`}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
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
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain sf-hide-scrollbar">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[30%]" />
                  <col className="w-[24%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                  <col className="w-[20%]" />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-white">
                  <tr className="border-b-2 border-slate-800 text-left text-slate-500">
                    <th className="py-2 pr-3 font-medium">Route</th>
                    <th className="py-2 pr-3 font-medium">Assignment</th>
                    <th className="py-2 pr-3 font-medium">Stops</th>
                    <th className="py-2 pr-3 font-medium">Distance</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const meta =
                      ROUTE_STATUS[r.routeStatus] ?? {
                        label: r.routeStatus,
                        tone: "neutral" as const,
                      };
                    const delayed = isRouteDelayed(r);
                    return (
                      <tr
                        key={r.id}
                        tabIndex={0}
                        onClick={() => setSelected(r)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelected(r);
                          }
                        }}
                        className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-tan-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tan-300 focus-visible:ring-inset"
                      >
                        <td className="py-3 pr-3 align-middle overflow-hidden">
                          <p className="font-medium text-slate-900 truncate">
                            {r.code} · {r.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {r.corridor}
                          </p>
                        </td>
                        <td className="py-3 pr-3 align-middle overflow-hidden">
                          <p className="text-slate-700 truncate">
                            {r.vehicleNumber ?? "—"}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {r.driverName ?? "Unassigned"}
                          </p>
                        </td>
                        <td className="py-3 pr-3 align-middle font-semibold tabular-nums whitespace-nowrap">
                          {r.completedStops}/{r.totalStops}
                        </td>
                        <td className="py-3 pr-3 align-middle text-slate-700 tabular-nums whitespace-nowrap">
                          {fmtKm(r.plannedDistanceKm)}
                        </td>
                        <td className="py-3 align-middle">
                          <Badge
                            tone={delayed ? "warning" : meta.tone}
                            className="whitespace-nowrap"
                          >
                            {delayed ? "Delayed" : meta.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
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
