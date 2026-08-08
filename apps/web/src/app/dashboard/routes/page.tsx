"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { PageHero } from "@/components/common/PageHero";

type Route = {
  id: string;
  routeStatus: string;
  plannedDistanceKm: string | null;
  co2Kg: string | null;
  totalStops: number;
  optimizationScore: string | null;
};

export default function RoutesPage() {
  const [rows, setRows] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await api<{ data: Route[] }>("/api/v1/routes");
    setRows(res.data);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function optimize() {
    setLoading(true);
    try {
      const vehicles = await api<{ data: { id: string }[] }>("/api/v1/vehicles");
      if (!vehicles.data[0]) {
        toast.error("Need a vehicle first");
        return;
      }
      const result = await api<{ status: string }>(
        "/api/v1/routes/optimize",
        {
          method: "POST",
          body: JSON.stringify({
            vehicleIds: [vehicles.data[0].id],
            depotLat: 19.076,
            depotLng: 72.877,
            deliveryLocations: [
              { id: "a", lat: 19.1, lng: 72.9, demand: 1 },
              { id: "b", lat: 19.12, lng: 72.85, demand: 1 },
              { id: "c", lat: 19.08, lng: 72.92, demand: 1 },
            ],
          }),
        },
      );
      toast.success(`Optimize ${result.status}`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Optimize failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        theme="sky"
        title="Route optimizer"
        subtitle="Multi-stop VRP — OR-Tools or nearest-neighbor fallback."
      >
        <Button onClick={optimize} disabled={loading}>
          {loading ? "Optimizing…" : "Optimize sample day"}
        </Button>
      </PageHero>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card accent="sky" hover>
          <p className="text-sm text-slate-500">Routes</p>
          <p className="font-display text-3xl font-bold text-sky-600">
            {rows.length}
          </p>
        </Card>
        <Card accent="mint" hover>
          <p className="text-sm text-slate-500">Total distance</p>
          <p className="font-display text-3xl font-bold text-emerald-600">
            {rows
              .reduce((s, r) => s + Number(r.plannedDistanceKm ?? 0), 0)
              .toFixed(1)}{" "}
            <span className="text-base font-medium text-slate-500">km</span>
          </p>
        </Card>
        <Card accent="sun" hover>
          <p className="text-sm text-slate-500">CO₂</p>
          <p className="font-display text-3xl font-bold text-amber-600">
            {rows.reduce((s, r) => s + Number(r.co2Kg ?? 0), 0).toFixed(1)}{" "}
            <span className="text-base font-medium text-slate-500">kg</span>
          </p>
        </Card>
      </div>

      <Card accent="lilac" className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="py-2">ID</th>
              <th className="py-2">Status</th>
              <th className="py-2">Stops</th>
              <th className="py-2">Distance</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-50">
                <td className="py-3 font-mono text-xs">{r.id.slice(0, 8)}</td>
                <td className="py-3">
                  <Badge tone="info">{r.routeStatus}</Badge>
                </td>
                <td className="py-3">{r.totalStops}</td>
                <td className="py-3">{r.plannedDistanceKm ?? "—"} km</td>
                <td className="py-3 font-semibold">
                  {r.optimizationScore ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
