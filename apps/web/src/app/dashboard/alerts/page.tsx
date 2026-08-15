"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { AlertsPanel, type AlertItem, isGeofenceAlert } from "@/components/dashboard/AlertsPanel";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { PageHero } from "@/components/common/PageHero";

const SEVERITY = [
  { id: "all", label: "All" },
  { id: "CRITICAL", label: "Critical" },
  { id: "WARNING", label: "Warning" },
  { id: "INFO", label: "Info" },
] as const;

export default function AlertsPage() {
  const [rows, setRows] = useState<AlertItem[]>([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<string>("all");

  const load = useCallback(async () => {
    const res = await api<{ data: AlertItem[] }>("/api/v1/alerts");
    setRows(res.data);
  }, []);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((a) => {
      if (isGeofenceAlert(a)) return false;
      if (severity !== "all" && a.alertSeverity !== severity) return false;
      if (!q) return true;
      const blob = [a.alertMessage, a.alertType, a.alertSeverity]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [rows, search, severity]);

  const openCount = rows.filter(
    (a) => !isGeofenceAlert(a) && !a.isResolved,
  ).length;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 [&>*]:!mb-0">
      <PageHero
        theme="coral"
        title="Live Alerts"
        subtitle="Speeding, fuel, maintenance — resolve in place."
      />

      <div className="flex flex-wrap gap-3 items-center shrink-0">
        <label className="relative inline-flex items-center">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 text-rose-600/70"
            aria-hidden
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts…"
            aria-label="Search alerts"
            size={36}
            className="w-auto max-w-full rounded-xl border-rose-200 bg-rose-50/40 pl-9 focus:border-rose-400 focus:ring-rose-400"
          />
        </label>
        {SEVERITY.map((s) => (
          <Button
            key={s.id}
            size="sm"
            variant={severity === s.id ? "primary" : "secondary"}
            onClick={() => setSeverity(s.id)}
          >
            {s.label}
          </Button>
        ))}
        <Badge
          tone="danger"
          pulse
          className="ml-auto rounded-xl px-3 py-1.5 text-sm"
        >
          {openCount} open
        </Badge>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <AlertsPanel
          alerts={filtered}
          onResolved={load}
          className="h-full min-h-0"
          showOpenCount={false}
        />
      </div>
    </div>
  );
}
