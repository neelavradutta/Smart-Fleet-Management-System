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

type AlertChrome = {
  card: string;
  badgeTone: "success" | "warning" | "danger" | "info" | "neutral";
  badgeClass?: string;
  typeClass: string;
  buttonVariant: "danger" | "primary" | "lilac" | "tan" | "success";
  buttonClass?: string;
};

function alertChrome(a: AlertItem): AlertChrome {
  if (a.isResolved) {
    return {
      card: "rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 to-lime-50/70 p-3 border-l-4 border-l-emerald-500",
      badgeTone: "success",
      typeClass: "text-xs text-emerald-700",
      buttonVariant: "success",
    };
  }
  const type = (a.alertType ?? "").toUpperCase();
  const sev = (a.alertSeverity ?? "").toUpperCase();

  if (type.includes("BREAKDOWN")) {
    return {
      card: "rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100/80 p-3 border-l-4 border-l-rose-500",
      badgeTone: "danger",
      typeClass: "text-xs text-rose-600",
      buttonVariant: "danger",
    };
  }
  if (type.includes("HARSH") || type.includes("SPEED")) {
    return {
      card: "rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50/80 p-3 border-l-4 border-l-orange-500",
      badgeTone: "warning",
      badgeClass: "bg-orange-100 text-orange-800 border-orange-300",
      typeClass: "text-xs text-orange-700",
      buttonVariant: "danger",
      buttonClass:
        "!bg-orange-500 hover:!bg-orange-600 !shadow-none !border-orange-600 text-white",
    };
  }
  if (type.includes("DELAY")) {
    return {
      card: "rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50/80 p-3 border-l-4 border-l-amber-500",
      badgeTone: "warning",
      typeClass: "text-xs text-amber-700",
      buttonVariant: "tan",
    };
  }
  if (type.includes("FUEL")) {
    return {
      card: "rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50/70 p-3 border-l-4 border-l-violet-500",
      badgeTone: "info",
      badgeClass: "bg-violet-100 text-violet-800 border-violet-300",
      typeClass: "text-xs text-violet-700",
      buttonVariant: "lilac",
    };
  }
  if (type.includes("MAINTENANCE")) {
    return {
      card: "rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50/80 p-3 border-l-4 border-l-sky-500",
      badgeTone: "info",
      typeClass: "text-xs text-sky-700",
      buttonVariant: "primary",
    };
  }

  if (sev === "CRITICAL") {
    return {
      card: "rounded-xl border border-rose-200 bg-gradient-to-r from-rose-50 to-rose-100/80 p-3 border-l-4 border-l-rose-500",
      badgeTone: "danger",
      typeClass: "text-xs text-rose-600",
      buttonVariant: "danger",
    };
  }
  if (sev === "WARNING") {
    return {
      card: "rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50/80 p-3 border-l-4 border-l-amber-500",
      badgeTone: "warning",
      typeClass: "text-xs text-amber-700",
      buttonVariant: "tan",
    };
  }
  return {
    card: "rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50/80 p-3 border-l-4 border-l-sky-500",
    badgeTone: "info",
    typeClass: "text-xs text-sky-700",
    buttonVariant: "primary",
  };
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
          Monitoring
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
            {visible.map((a) => {
              const chrome = alertChrome(a);
              return (
                <div key={a.id} className={chrome.card}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge tone={chrome.badgeTone} className={chrome.badgeClass}>
                      {a.alertSeverity}
                    </Badge>
                    <span className={chrome.typeClass}>{a.alertType}</span>
                  </div>
                  <p className="text-sm text-slate-800 mb-2">{a.alertMessage}</p>
                  {!a.isResolved ? (
                    <Button
                      size="sm"
                      variant={chrome.buttonVariant}
                      className={chrome.buttonClass}
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
              );
            })}
          </motion.div>
        )}
      </div>
    </Card>
  );
}
