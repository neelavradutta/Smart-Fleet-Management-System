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
  bar: string;
  badgeTone: "success" | "warning" | "danger" | "info" | "neutral";
  badgeClass?: string;
  typeClass: string;
  buttonVariant: "danger" | "primary" | "lilac" | "tan" | "success";
  buttonClass?: string;
};

const CRITICAL_CHROME: AlertChrome = {
  card: "rounded-xl border border-slate-200 bg-slate-100 p-3",
  bar: "bg-red-600",
  badgeTone: "danger",
  badgeClass: "!bg-red-600 !text-white !border-red-600",
  typeClass: "text-xs text-slate-600",
  buttonVariant: "success",
};

const WARNING_CHROME: AlertChrome = {
  card: "rounded-xl border border-yellow-300 bg-yellow-100 p-3",
  bar: "bg-amber-600",
  badgeTone: "warning",
  badgeClass: "!bg-amber-300 !text-amber-950 !border-amber-400",
  typeClass: "text-xs text-amber-950",
  buttonVariant: "tan",
  buttonClass:
    "!bg-amber-600 hover:!bg-amber-700 !shadow-none !border-amber-600 !text-white",
};

const INFO_CHROME: AlertChrome = {
  card: "rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50/80 p-3",
  bar: "bg-sky-500",
  badgeTone: "info",
  typeClass: "text-xs text-sky-700",
  buttonVariant: "primary",
};

function alertChrome(a: AlertItem): AlertChrome {
  if (a.isResolved) {
    return {
      card: "rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 to-lime-50/70 p-3",
      bar: "bg-emerald-500",
      badgeTone: "success",
      typeClass: "text-xs text-emerald-700",
      buttonVariant: "success",
    };
  }
  const type = (a.alertType ?? "").toUpperCase();
  const sev = (a.alertSeverity ?? "").toUpperCase();

  if (type.includes("BREAKDOWN") || sev === "CRITICAL") {
    return CRITICAL_CHROME;
  }
  if (sev === "WARNING") {
    return WARNING_CHROME;
  }
  return INFO_CHROME;
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
            className="space-y-3 pt-2 pb-1"
          >
            {visible.map((a) => {
              const chrome = alertChrome(a);
              return (
                <div
                  key={a.id}
                  className="group relative transition-transform duration-200 ease-out hover:-translate-y-1"
                >
                  <div className={cn("relative overflow-hidden", chrome.card)}>
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute top-0 left-0 z-10 h-[3px] w-0 rounded-r-full transition-[width] duration-200 ease-out group-hover:w-full",
                        chrome.bar,
                      )}
                    />
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
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </Card>
  );
}
