"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AlertsPanel, type AlertItem } from "@/components/dashboard/AlertsPanel";
import { PageHero } from "@/components/common/PageHero";

export default function AlertsPage() {
  const [rows, setRows] = useState<AlertItem[]>([]);
  const load = useCallback(async () => {
    const res = await api<{ data: AlertItem[] }>("/api/v1/alerts");
    setRows(res.data);
  }, []);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHero
        theme="coral"
        title="Alert inbox"
        subtitle="Geofence, speeding, fuel, maintenance — resolve in place."
      />
      <AlertsPanel alerts={rows} onResolved={load} />
    </div>
  );
}
