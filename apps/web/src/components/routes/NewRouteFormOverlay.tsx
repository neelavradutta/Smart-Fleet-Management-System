"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/common/Button";
import { DatePickerField } from "@/components/common/DatePickerField";
import type { RouteDetails } from "@/components/routes/types";

const MUMBAI_STOPS = [
  { label: "BKC Depot", address: "G Block, Bandra Kurla Complex", lat: 19.066, lng: 72.8697 },
  { label: "Bandra West", address: "Linking Road hub", lat: 19.0596, lng: 72.8295 },
  { label: "Andheri East", address: "Chakala industrial", lat: 19.1197, lng: 72.8468 },
  { label: "Andheri West", address: "Lokhandwala cluster", lat: 19.136, lng: 72.829 },
  { label: "Worli", address: "Sea Face warehouse", lat: 19.0176, lng: 72.8156 },
  { label: "Dadar", address: "Plaza depot bay", lat: 19.0178, lng: 72.8478 },
  { label: "Powai", address: "Lake View hub", lat: 19.1176, lng: 72.906 },
  { label: "Thane West", address: "Station road yard", lat: 19.2183, lng: 72.9781 },
  { label: "Goregaon", address: "Link Road hub", lat: 19.1663, lng: 72.8526 },
  { label: "Vashi", address: "Sector 17 workshop", lat: 19.077, lng: 72.998 },
] as const;

type StopDraft = {
  key: string;
  preset: string;
};

const emptyForm = {
  name: "",
  routeType: "DELIVERY",
  vehicleId: "",
  driverId: "",
  depot: "BKC Depot",
  plannedStartDate: "",
  plannedEndDate: "",
};

type FormState = typeof emptyForm;

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-tan-400 focus:outline-none focus:ring-2 focus:ring-tan-200";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block space-y-1 min-w-0">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="font-display text-sm font-semibold text-slate-900 border-b-2 border-slate-800 pb-2">
        {title}
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">{children}</div>
    </section>
  );
}

function presetOf(label: string) {
  return MUMBAI_STOPS.find((s) => s.label === label) ?? MUMBAI_STOPS[0];
}

export function NewRouteFormOverlay({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (route: RouteDetails) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [stops, setStops] = useState<StopDraft[]>([
    { key: "s1", preset: "BKC Depot" },
    { key: "s2", preset: "Andheri East" },
  ]);
  const [vehicles, setVehicles] = useState<{ id: string; vehicleNumber: string }[]>(
    [],
  );
  const [drivers, setDrivers] = useState<{ id: string; fullName: string; status: string }[]>(
    [],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setStops([
      { key: "s1", preset: "BKC Depot" },
      { key: "s2", preset: "Andheri East" },
    ]);
    setError(null);
    api<{ data: { id: string; vehicleNumber: string }[] }>("/api/v1/vehicles")
      .then((res) => setVehicles(res.data))
      .catch(console.error);
    api<{ data: { id: string; fullName: string; status: string }[] }>("/api/v1/drivers")
      .then((res) =>
        setDrivers(res.data.filter((d) => d.status !== "OFFBOARDED")),
      )
      .catch(console.error);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Route name required.");
      return;
    }
    if (stops.length < 2) {
      setError("Need at least two stops.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const mapped = stops.map((s, i) => {
        const p = presetOf(s.preset);
        return {
          id: `new-${i + 1}`,
          seq: i + 1,
          label: p.label,
          address: p.address,
          lat: p.lat,
          lng: p.lng,
          status: "PENDING",
        };
      });
      const first = mapped[0]?.label;
      const last = mapped[mapped.length - 1]?.label;
      const res = await api<{ data: RouteDetails }>("/api/v1/routes", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          routeType: form.routeType,
          vehicleId: form.vehicleId || undefined,
          driverId: form.driverId || undefined,
          depot: form.depot.trim() || "BKC Depot",
          corridor: first && last ? `${first} → ${last}` : undefined,
          plannedStartTime: form.plannedStartDate
            ? new Date(`${form.plannedStartDate}T06:00:00`).toISOString()
            : undefined,
          plannedEndTime: form.plannedEndDate
            ? new Date(`${form.plannedEndDate}T18:00:00`).toISOString()
            : undefined,
          stops: mapped,
        }),
      });
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add route");
    } finally {
      setSaving(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-route-title"
            initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-t-[28px] sm:rounded-[28px] bg-white border border-slate-200 shadow-[0_28px_90px_-24px_rgba(15,23,42,0.4)]"
          >
            <div className="flex items-start justify-between gap-4 bg-tan-700 px-5 sm:px-7 pt-5 pb-5">
              <div>
                <h2
                  id="new-route-title"
                  className="font-display text-2xl font-semibold text-white"
                >
                  New route
                </h2>
                <p className="mt-1 text-sm text-white/85">
                  Name, assignment, schedule, and stops.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close form"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={submit}
              className="overflow-y-auto max-h-[calc(92vh-7.5rem)] px-5 sm:px-7 py-5 space-y-5 sf-hide-scrollbar"
            >
              <Section title="Route">
                <Field label="Name *">
                  <input
                    required
                    className={fieldClass}
                    value={form.name}
                    onChange={set("name")}
                    placeholder="West Express"
                  />
                </Field>
                <Field label="Type">
                  <select
                    className={fieldClass}
                    value={form.routeType}
                    onChange={set("routeType")}
                  >
                    <option value="DELIVERY">Delivery</option>
                    <option value="COLLECTION">Collection</option>
                    <option value="SERVICE">Service</option>
                    <option value="SWEEP">Sweep</option>
                  </select>
                </Field>
                <Field label="Depot">
                  <input
                    className={fieldClass}
                    value={form.depot}
                    onChange={set("depot")}
                    placeholder="BKC Depot"
                  />
                </Field>
                <Field label="Vehicle">
                  <select
                    className={fieldClass}
                    value={form.vehicleId}
                    onChange={set("vehicleId")}
                  >
                    <option value="">Unassigned</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.vehicleNumber}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Driver">
                  <select
                    className={fieldClass}
                    value={form.driverId}
                    onChange={set("driverId")}
                  >
                    <option value="">Unassigned</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Planned start">
                  <DatePickerField
                    value={form.plannedStartDate}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, plannedStartDate: v }))
                    }
                  />
                </Field>
                <Field label="Planned end">
                  <DatePickerField
                    value={form.plannedEndDate}
                    onChange={(v) =>
                      setForm((prev) => ({ ...prev, plannedEndDate: v }))
                    }
                  />
                </Field>
              </Section>

              <section className="space-y-3">
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
                  <h3 className="font-display text-sm font-semibold text-slate-900">
                    Stops
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      setStops((prev) => [
                        ...prev,
                        {
                          key: `s${Date.now()}`,
                          preset: "Powai",
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-tan-700 hover:bg-tan-100"
                  >
                    <Plus size={13} />
                    Add stop
                  </button>
                </div>
                <div className="space-y-2">
                  {stops.map((stop, i) => (
                    <div
                      key={stop.key}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2"
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-tan-100 text-xs font-bold text-tan-700">
                        {i + 1}
                      </span>
                      <select
                        className={`${fieldClass} flex-1`}
                        value={stop.preset}
                        onChange={(e) =>
                          setStops((prev) =>
                            prev.map((s) =>
                              s.key === stop.key
                                ? { ...s, preset: e.target.value }
                                : s,
                            ),
                          )
                        }
                      >
                        {MUMBAI_STOPS.map((p) => (
                          <option key={p.label} value={p.label}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        aria-label="Remove stop"
                        disabled={stops.length <= 2}
                        onClick={() =>
                          setStops((prev) => prev.filter((s) => s.key !== stop.key))
                        }
                        className="grid h-8 w-8 place-items-center rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {error ? (
                <p className="text-sm font-medium text-rose-600">{error}</p>
              ) : null}

              <div className="flex flex-wrap gap-3 pb-2 pt-4 border-t border-slate-100">
                <Button type="submit" variant="tan" disabled={saving}>
                  {saving ? "Saving…" : "Register"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setForm(emptyForm);
                    setStops([
                      { key: "s1", preset: "BKC Depot" },
                      { key: "s2", preset: "Andheri East" },
                    ]);
                    setError(null);
                  }}
                  disabled={saving}
                >
                  Reset
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
