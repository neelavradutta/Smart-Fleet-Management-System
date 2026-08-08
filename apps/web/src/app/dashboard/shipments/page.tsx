"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { MapPinned, Package } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingBlock } from "@/components/common/LoadingBlock";
import { PageHero } from "@/components/common/PageHero";
import { TrackingOverlay } from "@/components/shipments/TrackingOverlay";

type Shipment = {
  id: string;
  customerName: string;
  deliveryAddress: string;
  shipmentStatus: string;
  trackingToken: string;
};

const NEXT: Record<string, string> = {
  CREATED: "ASSIGNED",
  ASSIGNED: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "DELIVERED",
};

export default function ShipmentsPage() {
  const [rows, setRows] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("Acme Retail");
  const [trackToken, setTrackToken] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api<{ data: Shipment[] }>("/api/v1/shipments");
      setRows(res.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await api("/api/v1/shipments", {
        method: "POST",
        body: JSON.stringify({
          customerName,
          pickupAddress: "Andheri Depot",
          deliveryAddress: "Bandra West Hub",
          pickupLat: 19.119,
          pickupLng: 72.846,
          deliveryLat: 19.06,
          deliveryLng: 72.83,
        }),
      });
      toast.success("Shipment created");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    }
  }

  async function advance(s: Shipment) {
    const next = NEXT[s.shipmentStatus];
    if (!next) return;
    try {
      if (next === "DELIVERED") {
        await api(`/api/v1/shipments/${s.id}/proof-of-delivery`, {
          method: "POST",
          body: JSON.stringify({
            photoUrls: [],
            notes: "Delivered via demo UI",
          }),
        });
      } else {
        await api(`/api/v1/shipments/${s.id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: next }),
        });
      }
      toast.success(`Status → ${next}`);
      await load();
      if (trackToken === s.trackingToken) {
        setTrackToken(null);
        requestAnimationFrame(() => setTrackToken(s.trackingToken));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  if (loading) return <LoadingBlock label="Loading shipments…" />;

  return (
    <div className="space-y-6">
      <PageHero
        theme="coral"
        title="Shipments"
        subtitle="Create, advance status — track opens as a soft overlay."
      />

      <Card accent="coral">
        <form onSubmit={onCreate} className="flex flex-wrap gap-3 items-end">
          <label className="flex-1 min-w-[200px]">
            <span className="text-sm font-medium text-slate-700">Customer</span>
            <input
              className="mt-1 w-full rounded-xl border-rose-200 bg-rose-50/40 focus:border-rose-400 focus:ring-rose-400"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </label>
          <Button type="submit">Create shipment</Button>
        </form>
      </Card>

      {rows.length === 0 ? (
        <EmptyState
          title="No shipments"
          hint="Create one above to start tracking."
        />
      ) : (
        <div className="grid gap-4">
          {rows.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                hover
                accent="coral"
                className="flex flex-wrap items-center justify-between gap-4"
              >
                <div className="min-w-[180px] flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 grid place-items-center shrink-0">
                    <Package size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {s.customerName}
                    </p>
                    <p className="text-sm text-slate-600">{s.deliveryAddress}</p>
                  </div>
                </div>
                <Badge
                  tone={
                    s.shipmentStatus === "DELIVERED"
                      ? "success"
                      : s.shipmentStatus === "FAILED"
                        ? "danger"
                        : "info"
                  }
                  pulse={
                    s.shipmentStatus !== "DELIVERED" &&
                    s.shipmentStatus !== "FAILED"
                  }
                >
                  {s.shipmentStatus.replaceAll("_", " ")}
                </Badge>
                <div className="flex flex-wrap gap-2">
                  {NEXT[s.shipmentStatus] ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => advance(s)}
                    >
                      Mark {NEXT[s.shipmentStatus].replaceAll("_", " ")}
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    onClick={() => setTrackToken(s.trackingToken)}
                  >
                    <MapPinned size={15} />
                    Track
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <TrackingOverlay
        open={Boolean(trackToken)}
        token={trackToken}
        onClose={() => setTrackToken(null)}
      />
    </div>
  );
}
