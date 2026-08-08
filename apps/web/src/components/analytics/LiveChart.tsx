"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/common/Card";
import { cn } from "@/utils/cn";

export type SeriesPoint = {
  t?: string;
  label: string;
  value: number;
};

const palettes = {
  sky: { stroke: "#0ea5e9", fill: "#0ea5e9", soft: "bg-sky-50 text-sky-700 border-sky-200" },
  mint: {
    stroke: "#10b981",
    fill: "#10b981",
    soft: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  sun: {
    stroke: "#f59e0b",
    fill: "#f59e0b",
    soft: "bg-amber-50 text-amber-800 border-amber-200",
  },
  coral: {
    stroke: "#f43f5e",
    fill: "#f43f5e",
    soft: "bg-rose-50 text-rose-700 border-rose-200",
  },
  lilac: {
    stroke: "#8b5cf6",
    fill: "#8b5cf6",
    soft: "bg-violet-50 text-violet-700 border-violet-200",
  },
};

export function LiveChart({
  title,
  data,
  color = "mint",
  unit = "",
  type = "area",
  live,
}: {
  title: string;
  data: SeriesPoint[];
  color?: keyof typeof palettes;
  unit?: string;
  type?: "area" | "bar";
  live?: boolean;
}) {
  const [windowSize, setWindowSize] = useState<8 | 12 | 24>(12);
  const [hover, setHover] = useState<SeriesPoint | null>(null);
  const p = palettes[color];
  const slice = useMemo(() => data.slice(-windowSize), [data, windowSize]);
  const latest = slice[slice.length - 1]?.value ?? 0;
  const prev = slice[slice.length - 2]?.value ?? latest;
  const delta = latest - prev;
  const gradId = `live-${color}-${title.replace(/\s/g, "")}`;

  return (
    <Card accent={color === "mint" ? "mint" : color === "sky" ? "sky" : color === "sun" ? "sun" : color === "coral" ? "coral" : "lilac"}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display text-lg font-semibold text-slate-900">
              {title}
            </h3>
            {live ? (
              <span className={cn("sf-chip border", p.soft)}>
                <span className="w-1.5 h-1.5 rounded-full bg-current inline-block mr-1 animate-pulse-soft" />
                Live
              </span>
            ) : null}
          </div>
          <p className="text-sm text-slate-500">
            {hover
              ? `${hover.label}: ${hover.value}${unit}`
              : `Now ${latest.toFixed(1)}${unit}`}
            {!hover && delta !== 0 ? (
              <span
                className={cn(
                  "ml-2 font-semibold",
                  delta > 0 ? "text-emerald-600" : "text-rose-600",
                )}
              >
                {delta > 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}
              </span>
            ) : null}
          </p>
        </div>
        <div className="flex gap-1">
          {([8, 12, 24] as const).map((n) => (
            <motion.button
              key={n}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setWindowSize(n)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors",
                windowSize === n
                  ? p.soft
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50",
              )}
            >
              {n} pts
            </motion.button>
          ))}
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart
              data={slice}
              onMouseMove={(state) => {
                const i = state?.activeTooltipIndex;
                if (typeof i === "number" && slice[i]) setHover(slice[i]);
              }}
              onMouseLeave={() => setHover(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} width={40} />
              <Tooltip
                cursor={{ fill: `${p.fill}15` }}
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${p.fill}55`,
                  background: "#fff",
                }}
              />
              <Bar
                dataKey="value"
                fill={p.fill}
                radius={[8, 8, 0, 0]}
                isAnimationActive
                animationDuration={650}
              />
            </BarChart>
          ) : (
            <AreaChart
              data={slice}
              onMouseMove={(state) => {
                const i = state?.activeTooltipIndex;
                if (typeof i === "number" && slice[i]) setHover(slice[i]);
              }}
              onMouseLeave={() => setHover(null)}
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={p.fill} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={p.fill} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} width={40} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${p.fill}55`,
                  background: "#fff",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={p.stroke}
                strokeWidth={3}
                fill={`url(#${gradId})`}
                isAnimationActive
                animationDuration={700}
                animationEasing="ease-out"
                activeDot={{
                  r: 6,
                  stroke: "#fff",
                  strokeWidth: 2,
                  fill: p.stroke,
                }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
