"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type Track = {
  shipmentStatus: string;
  customerName: string;
  deliveryAddress: string;
  expectedDeliveryTime: string | null;
  actualDeliveryTime: string | null;
};

const steps = ["CREATED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];

export default function PublicTrackPage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<Track | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/track/${params.token}`)
      .then(async (r) => {
        const body = await r.json();
        if (!r.ok) throw new Error(body.error ?? "Not found");
        setData(body.data);
      })
      .catch((e) => setError(e.message));
  }, [params.token]);

  const idx = data ? steps.indexOf(data.shipmentStatus) : -1;

  return (
    <div className="min-h-screen grid place-items-center bg-[radial-gradient(circle_at_top,_#e0f7ff,_#f8f9fa_50%)] p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Card glow>
          <p className="text-sm text-slate-500 mb-1">Shipment tracking</p>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">SFMS Track</h1>
          {error ? <p className="text-red-600 text-sm">{error}</p> : null}
          {data ? (
            <>
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    {data.customerName}
                  </p>
                  <p className="text-sm text-slate-600">{data.deliveryAddress}</p>
                </div>
                <Badge
                  tone={
                    data.shipmentStatus === "DELIVERED" ? "success" : "info"
                  }
                >
                  {data.shipmentStatus}
                </Badge>
              </div>
              <div className="space-y-3 relative pl-2">
                <div className="absolute left-[11px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-brand-500 to-transparent" />
                {steps.map((step, i) => (
                  <div key={step} className="flex gap-3 relative">
                    <div
                      className={`w-6 h-6 rounded-full border-2 z-10 bg-white ${
                        i <= idx
                          ? "border-brand-500 bg-brand-500"
                          : "border-slate-300"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        {step.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-6">
                ETA {data.expectedDeliveryTime ?? "updating…"}
              </p>
            </>
          ) : !error ? (
            <p className="text-slate-500 text-sm">Loading…</p>
          ) : null}
        </Card>
      </motion.div>
    </div>
  );
}
