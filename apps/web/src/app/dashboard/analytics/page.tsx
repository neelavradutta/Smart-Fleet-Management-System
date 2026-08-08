"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Fuel,
  Leaf,
  Radio,
  ShieldCheck,
  Timer,
  Wallet,
} from "lucide-react";
import { api } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card } from "@/components/common/Card";
import { PageHero } from "@/components/common/PageHero";
import { Badge } from "@/components/common/Badge";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { LiveChart, type SeriesPoint } from "@/components/analytics/LiveChart";
import { RealtimeMetrics } from "@/components/dashboard/RealtimeMetrics";
import { cn } from "@/utils/cn";

type SeriesMap = {
  onTime: SeriesPoint[];
  distance: SeriesPoint[];
  cost: SeriesPoint[];
  co2: SeriesPoint[];
};

type LiveAnalytics = {
  totalVehicles: number;
  activeVehicles: number;
  totalDrivers: number;
  avgSafetyScore: number;
  onTimeDeliveryRate: number;
  totalDistanceKm: number;
  totalCo2Kg: number;
  avgUtilization: number;
  avgCostPerKm: number;
  esgScore: number;
  carbonOffsetsKg: number;
  greenRouteHint: string;
  series: SeriesMap;
  updatedAt: string;
};

type FocusKey = "onTime" | "distance" | "cost" | "co2";

const emptySeries: SeriesMap = {
  onTime: [],
  distance: [],
  cost: [],
  co2: [],
};

export default function AnalyticsPage() {
  const [live, setLive] = useState<LiveAnalytics | null>(null);
  const [focus, setFocus] = useState<FocusKey>("onTime");
  const [pulse, setPulse] = useState(0);
  const { data: wsPayload, connected } = useWebSocket<LiveAnalytics>(
    "analytics_update",
  );

  const apply = useCallback((data: LiveAnalytics) => {
    setLive(data);
    setPulse((p) => p + 1);
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await api<{ data: LiveAnalytics }>("/api/v1/analytics/live");
      apply(res.data);
    } catch {
      const [o, e] = await Promise.all([
        api<{ data: Partial<LiveAnalytics> }>("/api/v1/analytics/fleet-overview"),
        api<{ data: Partial<LiveAnalytics> }>("/api/v1/analytics/esg"),
      ]);
      apply({
        totalVehicles: o.data.totalVehicles ?? 0,
        activeVehicles: o.data.activeVehicles ?? 0,
        totalDrivers: o.data.totalDrivers ?? 0,
        avgSafetyScore: o.data.avgSafetyScore ?? 0,
        onTimeDeliveryRate: o.data.onTimeDeliveryRate ?? 0,
        totalDistanceKm: o.data.totalDistanceKm ?? 0,
        totalCo2Kg: o.data.totalCo2Kg ?? e.data.totalCo2Kg ?? 0,
        avgUtilization: o.data.avgUtilization ?? 0,
        avgCostPerKm: o.data.avgCostPerKm ?? 0,
        esgScore: e.data.esgScore ?? 0,
        carbonOffsetsKg: e.data.carbonOffsetsKg ?? 0,
        greenRouteHint:
          e.data.greenRouteHint ?? "Optimize routes to cut emissions.",
        series: o.data.series ?? emptySeries,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [apply]);

  useEffect(() => {
    load().catch(console.error);
    const t = setInterval(() => load().catch(() => undefined), 8000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    if (!wsPayload?.updatedAt) return;
    apply(wsPayload);
  }, [wsPayload, apply]);

  const trends = useMemo(() => {
    if (!live) return { onTime: 0, cost: 0, esg: 0, util: 0 };
    const series = live.series ?? emptySeries;
    const delta = (arr: SeriesPoint[]) => {
      if (arr.length < 2) return 0;
      const a = arr[arr.length - 1].value;
      const b = arr[arr.length - 2].value;
      if (!b) return 0;
      return ((a - b) / Math.abs(b)) * 100;
    };
    return {
      onTime: delta(series.onTime),
      cost: delta(series.cost),
      esg: delta(series.co2) * -0.3,
      util: delta(series.distance),
    };
  }, [live, pulse]);

  const focusMeta: Record<
    FocusKey,
    { label: string; color: "sky" | "mint" | "sun" | "coral"; unit: string }
  > = {
    onTime: { label: "On-time %", color: "mint", unit: "%" },
    distance: { label: "Distance pulse", color: "sky", unit: " km" },
    cost: { label: "Cost / km", color: "sun", unit: " ₹" },
    co2: { label: "CO₂ pulse", color: "coral", unit: " kg" },
  };

  return (
    <div className="space-y-6">
      <PageHero
        theme="sun"
        title="Analytics"
        subtitle="Fleet KPIs stream every ~3s — hover charts, switch windows, watch values glide."
      >
        <Badge tone={connected ? "success" : "warning"} pulse={connected}>
          <Radio size={12} className="mr-1 inline" />
          {connected ? "WS live" : "Polling"}
        </Badge>
      </PageHero>

      <RealtimeMetrics
        liveLabel={connected ? "Socket live" : "Refreshing"}
        metrics={[
          {
            label: "On-time %",
            value: live?.onTimeDeliveryRate ?? 0,
            decimals: 1,
            color: "green",
            icon: <Timer size={20} />,
            trend: trends.onTime,
          },
          {
            label: "Distance",
            value: live?.totalDistanceKm ?? 0,
            decimals: 1,
            unit: "km",
            color: "cyan",
            icon: <Activity size={20} />,
          },
          {
            label: "Cost / km",
            value: live?.avgCostPerKm ?? 0,
            decimals: 2,
            unit: "₹",
            color: "amber",
            icon: <Wallet size={20} />,
            trend: trends.cost,
          },
          {
            label: "ESG score",
            value: live?.esgScore ?? 0,
            decimals: 1,
            color: "purple",
            icon: <Leaf size={20} />,
            trend: trends.esg,
          },
        ]}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(
          [
            ["onTime", "On-time", live?.onTimeDeliveryRate, "%"],
            ["distance", "Distance", live?.totalDistanceKm, "km"],
            ["cost", "Cost/km", live?.avgCostPerKm, "₹"],
            ["co2", "CO₂", live?.totalCo2Kg, "kg"],
          ] as const
        ).map(([key, label, value, unit]) => (
          <motion.button
            key={key}
            type="button"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFocus(key)}
            className={cn(
              "rounded-2xl border p-4 text-left transition-colors bg-white shadow-card",
              focus === key
                ? "border-sky-400 ring-2 ring-sky-100"
                : "border-slate-200 hover:border-sky-200",
            )}
          >
            <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
            <p className="font-display text-2xl font-semibold text-slate-900">
              <AnimatedNumber
                value={Number(value ?? 0)}
                decimals={key === "cost" ? 2 : 1}
                flash
              />
              <span className="text-xs text-slate-500 ml-1">{unit}</span>
            </p>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <LiveChart
          live
          title={focusMeta[focus].label}
          data={live?.series?.[focus] ?? []}
          color={focusMeta[focus].color}
          unit={focusMeta[focus].unit}
          type={focus === "distance" || focus === "co2" ? "bar" : "area"}
        />
        <LiveChart
          live
          title="Cost / km trend"
          data={live?.series?.cost ?? []}
          color="sun"
          unit=" ₹"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card accent="lilac" className="xl:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="text-violet-600" size={18} />
            <h3 className="font-display text-lg font-semibold text-violet-900">
              ESG pulse
            </h3>
          </div>
          <p className="font-display text-5xl font-semibold text-violet-700 mb-2">
            <AnimatedNumber value={live?.esgScore ?? 0} decimals={1} flash />
          </p>
          <p className="text-sm text-slate-600 mb-4">
            CO₂{" "}
            <AnimatedNumber
              value={live?.totalCo2Kg ?? 0}
              decimals={1}
              className="font-semibold text-rose-600"
            />{" "}
            kg · offsets{" "}
            <AnimatedNumber
              value={live?.carbonOffsetsKg ?? 0}
              decimals={1}
              className="font-semibold text-emerald-600"
            />{" "}
            kg
          </p>
          <motion.p
            key={live?.greenRouteHint}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-violet-900 bg-violet-50 border border-violet-100 rounded-xl p-3"
          >
            {live?.greenRouteHint ?? "Loading tip…"}
          </motion.p>
        </Card>

        <Card accent="mint" className="xl:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="text-emerald-600" size={18} />
            <h3 className="font-display text-lg font-semibold text-emerald-900">
              Ops health
            </h3>
          </div>
          <div className="space-y-4">
            {[
              {
                label: "Utilization",
                value: live?.avgUtilization ?? 0,
                color: "bg-emerald-500",
              },
              {
                label: "Safety score",
                value: live?.avgSafetyScore ?? 0,
                color: "bg-sky-500",
              },
              {
                label: "Active fleet",
                value:
                  live && live.totalVehicles
                    ? (live.activeVehicles / live.totalVehicles) * 100
                    : 0,
                color: "bg-amber-500",
              },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-semibold text-slate-900">
                    <AnimatedNumber value={row.value} decimals={1} flash />%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full", row.color)}
                    animate={{ width: `${Math.min(100, row.value)}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card accent="sky" className="xl:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Fuel className="text-sky-600" size={18} />
            <h3 className="font-display text-lg font-semibold text-sky-900">
              Live snapshot
            </h3>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between gap-3">
              <span className="text-slate-500">Active vehicles</span>
              <span className="font-semibold text-sky-700">
                <AnimatedNumber value={live?.activeVehicles ?? 0} flash /> /{" "}
                {live?.totalVehicles ?? "—"}
              </span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-slate-500">Drivers</span>
              <span className="font-semibold text-slate-800">
                <AnimatedNumber value={live?.totalDrivers ?? 0} flash />
              </span>
            </li>
            <li className="flex justify-between gap-3">
              <span className="text-slate-500">Last tick</span>
              <span className="font-medium text-slate-700">
                {live?.updatedAt
                  ? new Date(live.updatedAt).toLocaleTimeString()
                  : "—"}
              </span>
            </li>
            <li className="rounded-xl bg-sky-50 border border-sky-100 p-3 text-sky-800">
              Click metric chips above to swap the main chart. Hover chart for
              point detail. Window buttons trim history.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
