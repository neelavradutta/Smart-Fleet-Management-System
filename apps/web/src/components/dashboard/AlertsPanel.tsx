"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { api } from "@/lib/api";

export type AlertItem = {
  id: string;
  alertType: string;
  alertSeverity: string;
  alertMessage: string;
  isResolved: boolean;
};

export function AlertsPanel({
  alerts,
  onResolved,
}: {
  alerts: AlertItem[];
  onResolved?: () => void;
}) {
  return (
    <Card accent="coral" className="h-full min-h-[380px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={{ rotate: [0, -12, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        >
          <Bell className="text-rose-500" size={18} />
        </motion.div>
        <h3 className="font-display text-lg font-semibold text-slate-900">
          Live Alerts
        </h3>
        <Badge tone="danger" pulse className="ml-auto">
          {alerts.filter((a) => !a.isResolved).length} open
        </Badge>
      </div>
      <div className="space-y-3 overflow-y-auto flex-1 pr-1">
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-500">No alerts — fleet calm.</p>
        ) : (
          <AnimatePresence initial={false}>
            {alerts.slice(0, 12).map((a, idx) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -16, height: 0 }}
                transition={{ delay: idx * 0.04, type: "spring", stiffness: 320, damping: 26 }}
                whileHover={{ scale: 1.015, x: 2 }}
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
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </Card>
  );
}
