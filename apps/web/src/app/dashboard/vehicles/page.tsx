"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import {
  VehicleCard,
  type VehicleCardModel,
} from "@/components/vehicles/VehicleCard";
import { VehicleDetailsOverlay } from "@/components/vehicles/VehicleDetailsOverlay";
import { Button } from "@/components/common/Button";
import { PageHero } from "@/components/common/PageHero";

function VehiclesPageInner() {
  const [rows, setRows] = useState<VehicleCardModel[]>([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<VehicleCardModel | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    api<{ data: VehicleCardModel[] }>("/api/v1/vehicles")
      .then((res) =>
        setRows(
          res.data.map((v, i) => ({
            ...v,
            healthScore: i === 3 ? 28 : 78 + ((i * 7) % 20),
            fuelLevel: 40 + ((i * 13) % 55),
          })),
        ),
      )
      .catch(console.error);
  }, []);

  useEffect(() => {
    const focus = searchParams.get("focus");
    if (!focus || !rows.length) return;
    const hit = rows.find((v) => v.id === focus);
    if (hit) setSelected(hit);
  }, [searchParams, rows]);

  const closeOverlay = useCallback(() => {
    setSelected(null);
    if (searchParams.get("focus")) {
      router.replace("/dashboard/vehicles", { scroll: false });
    }
  }, [router, searchParams]);

  const filtered = useMemo(() => {
    return rows
      .filter((v) => (status === "all" ? true : v.status === status))
      .filter((v) => {
        const q = search.toLowerCase();
        if (!q) return true;
        return (
          v.vehicleNumber.toLowerCase().includes(q) ||
          (v.licensePlate ?? "").toLowerCase().includes(q)
        );
      });
  }, [rows, status, search]);

  return (
    <div className="space-y-6">
      <PageHero
        theme="sun"
        title="Fleet vehicles"
        subtitle="Manage health, fuel, and maintenance across the fleet."
      />

      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search number or plate…"
          className="rounded-xl border-amber-200 bg-amber-50/40 focus:border-fuchsia-400 focus:ring-fuchsia-400 min-w-[220px]"
        />
        {["all", "ACTIVE", "MAINTENANCE", "INACTIVE"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "primary" : "secondary"}
            onClick={() => setStatus(s)}
          >
            {s === "all" ? "All" : s}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {filtered.map((vehicle, idx) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <VehicleCard
                vehicle={vehicle}
                onViewDetails={(v) => setSelected(v)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <VehicleDetailsOverlay
        open={Boolean(selected)}
        vehicle={selected}
        onClose={closeOverlay}
      />
    </div>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <PageHero
            theme="sun"
            title="Fleet vehicles"
            subtitle="Manage health, fuel, and maintenance across the fleet."
          />
          <p className="text-sm text-slate-500">Loading fleet…</p>
        </div>
      }
    >
      <VehiclesPageInner />
    </Suspense>
  );
}
