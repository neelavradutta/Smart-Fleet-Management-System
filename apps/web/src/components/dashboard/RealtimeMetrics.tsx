"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/common/Card";
import { AnimatedNumber } from "@/components/common/AnimatedNumber";
import { staggerContainer, staggerItem } from "@/lib/motion";

export type Metric = {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  color: "cyan" | "purple" | "green" | "amber";
  icon: React.ReactNode;
  decimals?: number;
};

const colorMap = {
  cyan: {
    accent: "sky" as const,
    bg: "bg-sky-200",
    text: "text-sky-700",
    value: "text-sky-700",
    ring: "ring-sky-100",
  },
  purple: {
    accent: "lilac" as const,
    bg: "bg-violet-200",
    text: "text-violet-700",
    value: "text-violet-700",
    ring: "ring-violet-100",
  },
  green: {
    accent: "mint" as const,
    bg: "bg-emerald-200",
    text: "text-emerald-700",
    value: "text-emerald-700",
    ring: "ring-emerald-100",
  },
  amber: {
    accent: "sun" as const,
    bg: "bg-amber-200",
    text: "text-amber-700",
    value: "text-amber-700",
    ring: "ring-amber-100",
  },
};

function toNumber(value: string | number): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value !== "—" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function RealtimeMetrics({
  metrics,
  liveLabel = "Live",
}: {
  metrics: Metric[];
  liveLabel?: string;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      {metrics.map((metric) => {
        const c = colorMap[metric.color];
        const numeric = toNumber(metric.value);
        return (
          <motion.div key={metric.label} variants={staggerItem} layout>
            <Card accent={c.accent} hover className="p-5">
              <div className="flex items-start justify-between mb-3">
                <motion.div
                  whileHover={{ rotate: -8, scale: 1.08 }}
                  className={`w-12 h-12 rounded-2xl ${c.bg} ${c.text} ring-4 ${c.ring} flex items-center justify-center`}
                >
                  {metric.icon}
                </motion.div>
                {metric.trend !== undefined ? (
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      metric.trend >= 0
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-rose-100 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {metric.trend >= 0 ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {Math.abs(metric.trend).toFixed(1)}%
                  </span>
                ) : null}
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">
                {metric.label}
              </p>
              <div className="flex items-baseline gap-2 min-h-[2.25rem]">
                {numeric !== null ? (
                  <AnimatedNumber
                    value={numeric}
                    decimals={metric.decimals ?? 0}
                    flash
                    className={`font-display text-3xl font-semibold ${c.value}`}
                  />
                ) : (
                  <span
                    className={`font-display text-3xl font-semibold ${c.value}`}
                  >
                    {metric.value}
                  </span>
                )}
                {metric.unit ? (
                  <span className="text-xs text-slate-500">{metric.unit}</span>
                ) : null}
              </div>
              <div className="mt-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
                <span className="text-xs font-semibold text-emerald-600">
                  {liveLabel}
                </span>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
