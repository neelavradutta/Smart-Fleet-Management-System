"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/common/Button";
import { DatePickerField } from "@/components/common/DatePickerField";
import type { VehicleCardModel } from "@/components/vehicles/VehicleCard";

const emptyForm = {
  vehicleNumber: "",
  licensePlate: "",
  vehicleType: "TRUCK",
  make: "",
  model: "",
  variant: "",
  year: "",
  color: "",
  fuelType: "DIESEL",
  carbonCopy: "",
  engineNumber: "",
  chassisNumber: "",
  registrationDate: "",
  registrationExpiry: "",
  registrationAuthority: "",
  insuranceProvider: "",
  policyNumber: "",
  insuranceStartDate: "",
  insuranceExpiryDate: "",
  pucCertificateNumber: "",
  pucIssueDate: "",
  pucExpiryDate: "",
  fitnessCertificate: "",
  permitExpiry: "",
};

type FormState = typeof emptyForm;

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200";

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

export function NewVehicleFormOverlay({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (vehicle: VehicleCardModel) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setError(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (document.querySelector('[data-date-picker-open="true"]')) return;
      onClose();
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
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const setDate =
    (key: keyof FormState) => (next: string) =>
      setForm((prev) => ({ ...prev, [key]: next }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleNumber.trim() || !form.licensePlate.trim()) {
      setError("Vehicle number and registration number required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body = {
        vehicleNumber: form.vehicleNumber.trim(),
        licensePlate: form.licensePlate.trim(),
        vehicleType: form.vehicleType,
        make: form.make.trim() || null,
        model: form.model.trim() || null,
        variant: form.variant.trim() || null,
        year: form.year ? Number(form.year) : null,
        color: form.color.trim() || null,
        fuelType: form.fuelType || null,
        carbonCopy: form.carbonCopy.trim() || null,
        engineNumber: form.engineNumber.trim() || null,
        chassisNumber: form.chassisNumber.trim() || null,
        vin: form.chassisNumber.trim() || null,
        status: "ACTIVE",
        registrationDate: form.registrationDate || null,
        registrationExpiry: form.registrationExpiry || null,
        registrationAuthority: form.registrationAuthority.trim() || null,
        registrationStatus: "ACTIVE",
        insuranceProvider: form.insuranceProvider.trim() || null,
        policyNumber: form.policyNumber.trim() || null,
        insuranceStartDate: form.insuranceStartDate || null,
        insuranceExpiryDate: form.insuranceExpiryDate || null,
        insuranceStatus: "ACTIVE",
        pucCertificateNumber: form.pucCertificateNumber.trim() || null,
        pucIssueDate: form.pucIssueDate || null,
        pucExpiryDate: form.pucExpiryDate || null,
        fitnessCertificate: form.fitnessCertificate.trim() || null,
        permitStatus: "ACTIVE",
        permitExpiry: form.permitExpiry || null,
        currentLatitude: "19.076090",
        currentLongitude: "72.877426",
        currentDriverName: null,
        checkInAt: null,
        checkOutAt: null,
        driverHistory: [],
        lastLocationUpdate: new Date().toISOString(),
      };
      const res = await api<{ data: VehicleCardModel }>(
        "/api/v1/vehicles",
        { method: "POST", body: JSON.stringify(body) },
      );
      onCreated({
        ...res.data,
        healthScore: 88,
        fuelLevel: 70,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add vehicle");
    } finally {
      setSaving(false);
    }
  };

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
            aria-labelledby="new-fleet-title"
            initial={
              reduce ? false : { opacity: 0, y: 40, scale: 0.96 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-t-[28px] sm:rounded-[28px] bg-white border border-slate-200 shadow-[0_28px_90px_-24px_rgba(15,23,42,0.4)]"
          >
            <div className="flex items-start justify-between gap-4 bg-sky-600 px-5 sm:px-7 pt-5 pb-5">
              <div>
                <h2
                  id="new-fleet-title"
                  className="font-display text-2xl font-semibold text-white"
                >
                  New fleet vehicle
                </h2>
                <p className="mt-1 text-sm text-white/85">
                  Fill profile, registration, and compliance details.
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
              className="overflow-y-auto max-h-[calc(92vh-8.5rem)] px-5 sm:px-7 py-5 space-y-6 sf-hide-scrollbar"
            >
              <Section title="Vehicle profile">
                <Field label="Vehicle number *">
                  <input
                    required
                    className={fieldClass}
                    value={form.vehicleNumber}
                    onChange={set("vehicleNumber")}
                    placeholder="TRK-010"
                  />
                </Field>
                <Field label="Registration number *">
                  <input
                    required
                    className={fieldClass}
                    value={form.licensePlate}
                    onChange={set("licensePlate")}
                    placeholder="MH12AB9999"
                  />
                </Field>
                <Field label="Vehicle type">
                  <select
                    className={fieldClass}
                    value={form.vehicleType}
                    onChange={set("vehicleType")}
                  >
                    {["TRUCK", "VAN", "BIKE", "CAR", "BUS"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Make / manufacturer">
                  <input
                    className={fieldClass}
                    value={form.make}
                    onChange={set("make")}
                    placeholder="Tata"
                  />
                </Field>
                <Field label="Model">
                  <input
                    className={fieldClass}
                    value={form.model}
                    onChange={set("model")}
                    placeholder="Prima"
                  />
                </Field>
                <Field label="Variant">
                  <input
                    className={fieldClass}
                    value={form.variant}
                    onChange={set("variant")}
                  />
                </Field>
                <Field label="Manufacturing year">
                  <input
                    type="number"
                    className={fieldClass}
                    value={form.year}
                    onChange={set("year")}
                    placeholder="2024"
                  />
                </Field>
                <Field label="Vehicle color">
                  <input
                    className={fieldClass}
                    value={form.color}
                    onChange={set("color")}
                  />
                </Field>
                <Field label="Fuel type">
                  <select
                    className={fieldClass}
                    value={form.fuelType}
                    onChange={set("fuelType")}
                  >
                    {["DIESEL", "PETROL", "CNG", "EV", "HYBRID"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Carbon copy / CC">
                  <input
                    className={fieldClass}
                    value={form.carbonCopy}
                    onChange={set("carbonCopy")}
                    placeholder="e.g. 2956"
                  />
                </Field>
                <Field label="Engine number">
                  <input
                    className={fieldClass}
                    value={form.engineNumber}
                    onChange={set("engineNumber")}
                  />
                </Field>
                <Field label="Chassis number">
                  <input
                    className={fieldClass}
                    value={form.chassisNumber}
                    onChange={set("chassisNumber")}
                  />
                </Field>
              </Section>

              <Section title="Registration details">
                <Field label="Registration date">
                  <DatePickerField
                    className={fieldClass}
                    value={form.registrationDate}
                    onChange={setDate("registrationDate")}
                  />
                </Field>
                <Field label="Registration expiry">
                  <DatePickerField
                    className={fieldClass}
                    value={form.registrationExpiry}
                    onChange={setDate("registrationExpiry")}
                  />
                </Field>
                <Field label="Registration authority / RTO">
                  <input
                    className={fieldClass}
                    value={form.registrationAuthority}
                    onChange={set("registrationAuthority")}
                    placeholder="RTO Pune (MH12)"
                  />
                </Field>
              </Section>

              <Section title="Insurance & PUC compliance">
                <Field label="Insurance provider">
                  <input
                    className={fieldClass}
                    value={form.insuranceProvider}
                    onChange={set("insuranceProvider")}
                  />
                </Field>
                <Field label="Policy number">
                  <input
                    className={fieldClass}
                    value={form.policyNumber}
                    onChange={set("policyNumber")}
                  />
                </Field>
                <Field label="Insurance start date">
                  <DatePickerField
                    className={fieldClass}
                    value={form.insuranceStartDate}
                    onChange={setDate("insuranceStartDate")}
                  />
                </Field>
                <Field label="Insurance expiry date">
                  <DatePickerField
                    className={fieldClass}
                    value={form.insuranceExpiryDate}
                    onChange={setDate("insuranceExpiryDate")}
                  />
                </Field>
                <Field label="PUC certificate number">
                  <input
                    className={fieldClass}
                    value={form.pucCertificateNumber}
                    onChange={set("pucCertificateNumber")}
                  />
                </Field>
                <Field label="PUC issue date">
                  <DatePickerField
                    className={fieldClass}
                    value={form.pucIssueDate}
                    onChange={setDate("pucIssueDate")}
                  />
                </Field>
                <Field label="PUC expiry date">
                  <DatePickerField
                    className={fieldClass}
                    value={form.pucExpiryDate}
                    onChange={setDate("pucExpiryDate")}
                  />
                </Field>
                <Field label="Fitness certificate">
                  <input
                    className={fieldClass}
                    value={form.fitnessCertificate}
                    onChange={set("fitnessCertificate")}
                    placeholder="FIT-MH12-xxxxx · Valid"
                  />
                </Field>
                <Field label="Permit expiry">
                  <DatePickerField
                    className={fieldClass}
                    value={form.permitExpiry}
                    onChange={setDate("permitExpiry")}
                  />
                </Field>
              </Section>

              {error ? (
                <p className="text-sm font-medium text-rose-600">{error}</p>
              ) : null}

              <div className="flex flex-wrap gap-3 pb-2 pt-4 border-t border-slate-100">
                <Button type="submit" variant="success" disabled={saving}>
                  {saving ? "Saving…" : "Register"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setForm(emptyForm);
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
