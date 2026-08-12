"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import {
  isRouteDelayed,
  nextPendingStop,
  ROUTE_STATUS,
  routeProgress,
  type RouteDetails,
} from "@/components/routes/types";

const rowTint = [
  "from-tan-100 to-tan-50 border-tan-300",
  "from-slate-100 to-slate-50 border-slate-300",
  "from-orange-100 to-amber-50 border-orange-300",
  "from-white to-slate-50 border-slate-100",
];

export function RouteRunBoard({
  routes,
  onSelect,
}: {
  routes: RouteDetails[];
  onSelect?: (route: RouteDetails) => void;
}) {
  const live = [...routes]
    .filter((r) => r.routeStatus === "ACTIVE" || r.routeStatus === "PLANNED")
    .sort((a, b) => {
      if (a.routeStatus !== b.routeStatus) {
        return a.routeStatus === "ACTIVE" ? -1 : 1;
      }
      return Number(b.optimizationScore ?? 0) - Number(a.optimizationScore ?? 0);
    });

  return (
    <Card accent="tan" className="h-full flex flex-col overflow-hidden">
      <h2 className="font-display text-xl font-semibold text-slate-900 mb-3 shrink-0">
        Run board
      </h2>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain sf-hide-scrollbar">
        {live.length === 0 ? (
          <p className="text-sm text-slate-500 px-1">No active or planned runs.</p>
        ) : null}
        {live.map((route, idx) => {
          const meta =
            ROUTE_STATUS[route.routeStatus] ?? {
              label: route.routeStatus,
              tone: "neutral" as const,
            };
          const next = nextPendingStop(route);
          const pct = routeProgress(route);
          const delayed = isRouteDelayed(route);
          return (
            <motion.button
              key={route.id}
              type="button"
              onClick={() => onSelect?.(route)}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: Math.min(idx, 6) * 0.06,
                type: "spring",
                stiffness: 320,
              }}
              whileHover={{ x: 4, scale: 1.01 }}
              className={`flex min-h-[4.75rem] shrink-0 flex-col justify-center gap-1.5 px-3 py-3 rounded-xl border bg-gradient-to-r text-left w-full cursor-pointer ${
                rowTint[Math.min(idx, 3)]
              }`}
            >
              <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 font-semibold text-slate-900 truncate">
                  {route.code} · {route.name}
                </p>
                <Badge tone={delayed ? "warning" : meta.tone}>
                  {delayed ? "Delayed" : meta.label}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {next ? `Next · ${next.label}` : route.corridor}
              </p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/80">
                  <div
                    className="h-full rounded-full bg-tan-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold tabular-nums text-slate-700">
                  {pct}%
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </Card>
  );
}
