"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
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

const DRIVER_STATUS: Record<
  string,
  { label: string; tone: "success" | "warning" | "danger" | "neutral" }
> = {
  ON_DUTY: { label: "On Duty", tone: "success" },
  OFF_DUTY: { label: "Off Duty", tone: "neutral" },
  ON_LEAVE: { label: "On Leave", tone: "warning" },
  OFFBOARDED: { label: "Offboarded", tone: "danger" },
  ACTIVE: { label: "On Duty", tone: "success" },
  INACTIVE: { label: "Off Duty", tone: "neutral" },
};


export default function DriversPage() {
  const [rows, setRows] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<{ data: Driver[] }>("/api/v1/drivers")
      .then((res) => setRows(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    const scroller = scrollerRef.current;
    if (!box || !scroller) return;

    const lockPageSwipe = () => {
      document.documentElement.style.overscrollBehaviorX = "none";
      document.body.style.overscrollBehaviorX = "none";
    };
    const unlockPageSwipe = () => {
      document.documentElement.style.overscrollBehaviorX = "";
      document.body.style.overscrollBehaviorX = "";
    };

    const onWheel = (e: WheelEvent) => {
      const dx = e.shiftKey ? e.deltaY + e.deltaX : e.deltaX;
      if (dx === 0) return;
      e.preventDefault();
      e.stopPropagation();
      scroller.scrollLeft += dx;
    };

    let dragging = false;
    let lastX = 0;
    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, button, a")) {
        return;
      }
      dragging = true;
      lastX = e.clientX;
      box.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const delta = lastX - e.clientX;
      lastX = e.clientX;
      if (delta === 0) return;
      e.preventDefault();
      scroller.scrollLeft += delta;
    };
    const onPointerUp = (e: PointerEvent) => {
      dragging = false;
      if (box.hasPointerCapture(e.pointerId)) {
        box.releasePointerCapture(e.pointerId);
      }
    };

    box.addEventListener("mouseenter", lockPageSwipe);
    box.addEventListener("mouseleave", unlockPageSwipe);
    box.addEventListener("wheel", onWheel, { passive: false });
    box.addEventListener("pointerdown", onPointerDown);
    box.addEventListener("pointermove", onPointerMove);
    box.addEventListener("pointerup", onPointerUp);
    box.addEventListener("pointercancel", onPointerUp);

    return () => {
      unlockPageSwipe();
      box.removeEventListener("mouseenter", lockPageSwipe);
      box.removeEventListener("mouseleave", unlockPageSwipe);
      box.removeEventListener("wheel", onWheel);
      box.removeEventListener("pointerdown", onPointerDown);
      box.removeEventListener("pointermove", onPointerMove);
      box.removeEventListener("pointerup", onPointerUp);
      box.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((d) => (d.fullName ?? "").toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <div className="space-y-6">
      <PageHero
        theme="lilac"
        title="Driver performance"
        subtitle="Safety scores, licenses, and behavior monitoring."
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5">
          <DriverLeaderboard drivers={rows} />
        </div>
        <Card
          accent="lilac"
          className="xl:col-span-7 min-w-0 overscroll-x-none"
        >
          <div ref={boxRef} className="min-w-0 overscroll-x-none">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Roster
            </h2>
            <label className="relative ml-auto inline-flex items-center">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 text-violet-600/70"
                aria-hidden
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name…"
                aria-label="Search drivers by name"
                size={28}
                className="w-auto max-w-full rounded-xl border-violet-200 bg-violet-50/50 pl-9 text-sm focus:border-violet-400 focus:ring-violet-400"
              />
            </label>
          </div>
          <div
            ref={scrollerRef}
            className="overflow-x-auto overscroll-x-none sf-hide-scrollbar"
          >
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="py-2 font-medium">Name</th>
                  <th className="py-2 font-medium">License</th>
                  <th className="py-2 font-medium">Safety</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
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
                      {(() => {
                        const meta =
                          DRIVER_STATUS[d.status] ?? {
                            label: d.status,
                            tone: "neutral" as const,
                          };
                        return (
                          <Badge tone={meta.tone}>{meta.label}</Badge>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
