"use client";

import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { PageHero } from "@/components/common/PageHero";

type Geofence = {
  id: string;
  name: string;
  geofenceType: string;
  centerLatitude: string;
  centerLongitude: string;
  radiusMeters: number;
};

export default function GeofencesPage() {
  const [rows, setRows] = useState<Geofence[]>([]);
  const [name, setName] = useState("Restricted Zone");

  async function load() {
    const res = await api<{ data: Geofence[] }>("/api/v1/geofences");
    setRows(res.data);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await api("/api/v1/geofences", {
      method: "POST",
      body: JSON.stringify({
        name,
        geofenceType: "RESTRICTED",
        centerLatitude: 19.076,
        centerLongitude: 72.877,
        radiusMeters: 800,
      }),
    });
    toast.success("Geofence created");
    await load();
  }

  return (
    <div className="space-y-6">
      <PageHero
        theme="mint"
        title="Geofences"
        subtitle="Restricted zones fire CRITICAL alerts on entry."
      />
      <Card accent="lime">
        <form onSubmit={onCreate} className="flex flex-wrap gap-3 items-end">
          <label className="flex-1 min-w-[200px]">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              className="mt-1 w-full rounded-xl border-lime-200 bg-lime-50/50 focus:border-emerald-400 focus:ring-emerald-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <Button type="submit">Add Mumbai sample fence</Button>
        </form>
      </Card>
      <div className="grid md:grid-cols-2 gap-4">
        {rows.map((g) => (
          <Card key={g.id} hover>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-900">{g.name}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {g.centerLatitude}, {g.centerLongitude} · {g.radiusMeters}m
                </p>
              </div>
              <Badge tone="warning">{g.geofenceType}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
