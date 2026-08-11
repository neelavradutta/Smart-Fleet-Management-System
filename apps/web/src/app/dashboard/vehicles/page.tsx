"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import {
  VehicleCard,
  type VehicleCardModel,
} from "@/components/vehicles/VehicleCard";
import { VehicleDetailsOverlay } from "@/components/vehicles/VehicleDetailsOverlay";
import { NewVehicleFormOverlay } from "@/components/vehicles/NewVehicleFormOverlay";
import { Button } from "@/components/common/Button";
import { PageHero } from "@/components/common/PageHero";
import { Plus, Search } from "lucide-react";

function VehiclesPageInner() {
  const [rows, setRows] = useState<VehicleCardModel[]>([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<VehicleCardModel | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
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
        const q = search.trim().toLowerCase();
        if (!q) return true;
        const vehicleNumber = (v.vehicleNumber ?? "").toLowerCase();
        const registrationNumber = (v.licensePlate ?? "").toLowerCase();
        return vehicleNumber.includes(q) || registrationNumber.includes(q);
      });
  }, [rows, status, search]);

  const changeStatus = (next: string) => {
    setStatus(next);
    // Always restart fleet list from top-left when filter changes.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    listRef.current?.scrollTo({ top: 0, left: 0 });
  };

  return (
    <div className="space-y-6">
      <PageHero
        theme="sun"
        title="Fleet vehicles"
        subtitle="Manage health, fuel, and maintenance across the fleet."
      />

      <div className="flex flex-wrap gap-3 items-center">
        <label className="relative inline-flex items-center">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 text-amber-700/70"
            aria-hidden
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicle number or registration number…"
            aria-label="Search vehicle number or registration number"
            size={44}
            className="w-auto max-w-full rounded-xl border-amber-200 bg-amber-50/40 pl-9 focus:border-fuchsia-400 focus:ring-fuchsia-400"
          />
        </label>
        {["all", "ACTIVE", "MAINTENANCE", "INACTIVE"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "primary" : "secondary"}
            onClick={() => changeStatus(s)}
          >
            {s === "all" ? "All" : s}
          </Button>
        ))}
        <Button
          size="sm"
          variant="success"
          className="ml-auto rounded-full px-4 py-2 font-semibold tracking-tight"
          onClick={() => setNewOpen(true)}
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20">
            <Plus size={13} strokeWidth={2.5} />
          </span>
          New fleet
        </Button>
      </div>

      <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((vehicle, idx) => (
            <motion.div
              key={`${status}-${vehicle.id}`}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ delay: Math.min(idx * 0.04, 0.2) }}
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
      <NewVehicleFormOverlay
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={(v) => {
          setRows((prev) => [v, ...prev]);
          setSelected(v);
        }}
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
