"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/common/Card";

const sample = [
  { date: "Mon", value: 88 },
  { date: "Tue", value: 91 },
  { date: "Wed", value: 86 },
  { date: "Thu", value: 93 },
  { date: "Fri", value: 95 },
  { date: "Sat", value: 90 },
  { date: "Sun", value: 92 },
];

export function PerformanceChart({
  data = sample,
  title = "On-time delivery trend",
}: {
  data?: { date: string; value: number }[];
  title?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card accent="mint">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-semibold text-emerald-800">
            {title}
          </h3>
          <span className="sf-chip-mint">7-day</span>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[70, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid #a7f3d0",
                  boxShadow: "0 12px 28px rgba(16,185,129,0.12)",
                  background: "#ffffff",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#colorPerf)"
                animationDuration={900}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}
