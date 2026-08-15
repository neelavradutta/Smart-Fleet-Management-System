"use client";

import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { api } from "@/lib/api";
import { cn } from "@/utils/cn";

export type AlertItem = {
  id: string;
  alertType: string;
  alertSeverity: string;
  alertMessage: string;
  isResolved: boolean;
};

export function isGeofenceAlert(a: AlertItem) {
  const type = (a.alertType ?? "").toUpperCase();
  const msg = a.alertMessage ?? "";
  return (
    type.includes("GEOFENCE") ||
    /geofence|restricted zone/i.test(msg)
  );
}

export function AlertsPanel({
  alerts,
  onResolved,
  className,
  showOpenCount = true,
  listKey = "list",
}: {
  alerts: AlertItem[];
  onResolved?: () => void;
  className?: string;
  showOpenCount?: boolean;
  listKey?: string;
}) {
  const visible = alerts.filter((a) => !isGeofenceAlert(a));
  return (
    <Card accent="coral" className={cn("h-full min-h-[380px] flex flex-col", className)}>
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <motion.div
          animate={{ rotate: [0, -12, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        >
          <Bell className="text-rose-500" size={18} />
        </motion.div>
        <h3 className="font-display text-lg font-semibold text-slate-900">
          Live Alerts
        </h3>
        {showOpenCount ? (
          <Badge tone="danger" pulse className="ml-auto">
            {visible.filter((a) => !a.isResolved).length} open
          </Badge>
        ) : null}
      </div>
      <div className="overflow-y-auto flex-1 min-h-0 pr-1 sf-hide-scrollbar">
        {visible.length === 0 ? (
          <p className="text-sm text-slate-500">No alerts — fleet calm.</p>
        ) : (
          <motion.div
            key={listKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3"
          >
            {visible.map((a) => (
              <div
                key={a.id}
                className="rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50/80 to-amber-50/50 p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    tone={
                      a.alertSeverity === "CRITICAL"
                        ? "danger"
                        : a.alertSeverity === "WARNING"
                          ? "warning"
                          : "info"
                    }
                  >
                    {a.alertSeverity}
                  </Badge>
                  <span className="text-xs text-slate-500">{a.alertType}</span>
                </div>
                <p className="text-sm text-slate-800 mb-2">{a.alertMessage}</p>
                {!a.isResolved ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      api(`/api/v1/alerts/${a.id}/resolve`, {
                        method: "PATCH",
                      }).then(() => onResolved?.())
                    }
                  >
                    Resolve
                  </Button>
                ) : (
                  <span className="text-xs text-emerald-600 font-medium">
                    Resolved
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </Card>
  );
}
