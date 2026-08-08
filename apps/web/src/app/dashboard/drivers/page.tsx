"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DriverLeaderboard, type LeaderDriver } from "@/components/drivers/DriverLeaderboard";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { PageHero } from "@/components/common/PageHero";

type Driver = LeaderDriver & {
  email: string;
  phone: string | null;
  licenseNumber: string;
  status: string;
};

export default function DriversPage() {
  const [rows, setRows] = useState<Driver[]>([]);

  useEffect(() => {
    api<{ data: Driver[] }>("/api/v1/drivers")
      .then((res) => setRows(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <PageHero
        theme="lilac"
        chip="People ops"
        title="Driver performance"
        subtitle="Safety scores, licenses, and behavior monitoring."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5">
          <DriverLeaderboard drivers={rows} />
        </div>
        <Card accent="lilac" className="xl:col-span-7 overflow-x-auto">
          <h2 className="font-display text-lg font-semibold text-slate-900 mb-4">
            Roster
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-100">
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">License</th>
                <th className="py-2 font-medium">Safety</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-slate-50">
                  <td className="py-3">
                    <p className="font-medium text-slate-900">{d.fullName}</p>
                    <p className="text-xs text-slate-500">{d.email}</p>
                  </td>
                  <td className="py-3 text-slate-700">{d.licenseNumber}</td>
                  <td className="py-3 font-semibold">
                    {Number(d.safetyScore).toFixed(1)}
                  </td>
                  <td className="py-3">
                    <Badge tone={d.status === "ACTIVE" ? "success" : "neutral"}>
                      {d.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
