"use client";

import { motion } from "framer-motion";
import { Medal, TrendingUp } from "lucide-react";
import { Card } from "@/components/common/Card";

export type LeaderDriver = {
  id: string;
  fullName: string;
  safetyScore: string | number;
  totalMiles?: number;
};

const rowTint = [
  "from-amber-50 to-yellow-50/40 border-amber-200",
  "from-sky-50 to-cyan-50/40 border-sky-200",
  "from-rose-50 to-orange-50/40 border-rose-200",
];

export function DriverLeaderboard({ drivers }: { drivers: LeaderDriver[] }) {
  const sorted = [...drivers].sort(
    (a, b) => Number(b.safetyScore) - Number(a.safetyScore),
  );

  return (
    <Card accent="sun" className="h-full flex flex-col overflow-hidden">
      <h2 className="font-display text-xl font-semibold text-slate-900 mb-3 shrink-0">
        Leaderboard
      </h2>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain sf-hide-scrollbar">
        {sorted.map((driver, idx) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(idx, 6) * 0.06, type: "spring", stiffness: 320 }}
            whileHover={{ x: 4, scale: 1.01 }}
            className={`flex h-[calc((100%-1rem)/3)] min-h-[4.75rem] shrink-0 items-center gap-3 px-3 py-3 rounded-xl border bg-gradient-to-r ${
              idx < 3 ? rowTint[idx] : "from-white to-slate-50 border-slate-100"
            }`}
          >
            <div className="w-7 flex justify-center shrink-0">
              {idx < 3 ? (
                <Medal
                  size={20}
                  className={
                    idx === 0
                      ? "text-amber-500"
                      : idx === 1
                        ? "text-sky-400"
                        : "text-rose-400"
                  }
                />
              ) : (
                <span className="font-bold text-slate-400">{idx + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">
                {driver.fullName}
              </p>
              <p className="text-xs text-slate-500">
                {driver.totalMiles ?? 0} miles logged
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-xl font-bold text-slate-900 leading-none">
                {Number(driver.safetyScore).toFixed(0)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">/100</p>
            </div>
            {Number(driver.safetyScore) > 90 ? (
              <TrendingUp className="text-emerald-500 shrink-0" size={16} />
            ) : null}
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
