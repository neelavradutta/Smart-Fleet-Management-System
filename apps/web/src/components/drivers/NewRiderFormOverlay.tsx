"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FileText, Upload, X } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/common/Button";
import { DatePickerField } from "@/components/common/DatePickerField";
import {
  DocUploadLayer,
  ViewEyeIcon,
  stashDriverDoc,
  type DocFile,
  type DriverDetails,
} from "@/components/drivers/DriverDetailsOverlay";

const DOC_SLOTS = [
  { key: "licenseDocument", label: "License Document" },
  { key: "idProof", label: "ID Proof" },
  { key: "employmentDocuments", label: "Employment Documents" },
  { key: "trainingCertificates", label: "Training Certificates" },
  { key: "medicalCertificate", label: "Medical Certificate" },
  { key: "otherDocuments", label: "Other Documents" },
] as const;

type DocKey = (typeof DOC_SLOTS)[number]["key"];

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  address: "",
  nationality: "",
  gender: "Male",
  emergencyContact: "",
  licenseNumber: "",
  licenseType: "",
  licenseClass: "",
  licenseIssueDate: "",
  licenseExpiry: "",
  licenseAuthority: "",
  licenseRestrictions: "",
};

type FormState = typeof emptyForm;

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200";

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

export function NewRiderFormOverlay({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (driver: DriverDetails) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [docs, setDocs] = useState<Partial<Record<DocKey, DocFile>>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<{
    key: DocKey;
    label: string;
    fileName: string;
    progress: number;
    phase: "uploading" | "failed" | "preview";
    file?: DocFile;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingSlot = useRef<(typeof DOC_SLOTS)[number] | null>(null);
  const reduce = useReducedMotion();
  const dismissJob = useCallback(() => setJob(null), []);

  async function runUpload(slot: (typeof DOC_SLOTS)[number], file: File) {
    setJob({
      key: slot.key,
      label: slot.label,
      fileName: file.name,
      progress: 0,
      phase: "uploading",
    });
    let p = 0;
    const tick = window.setInterval(() => {
      p = Math.min(p + 3 + Math.random() * 4, 90);
      setJob((j) =>
        j && j.phase === "uploading" ? { ...j, progress: Math.round(p) } : j,
      );
    }, 80);
    try {
      if (file.size <= 0) throw new Error("empty");
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
      const stored: DocFile = {
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        mime: file.type || "application/octet-stream",
      };
      setDocs((prev) => {
        const old = prev[slot.key];
        if (old?.fileUrl.startsWith("blob:")) URL.revokeObjectURL(old.fileUrl);
        return { ...prev, [slot.key]: stored };
      });
      clearInterval(tick);
      setJob((j) =>
        j ? { ...j, progress: 100, phase: "preview", file: stored } : j,
      );
    } catch {
      clearInterval(tick);
      setJob((j) => (j ? { ...j, phase: "failed", progress: 100 } : j));
    }
  }

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setDocs({});
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

  const setDate = (key: keyof FormState) => (next: string) =>
    setForm((prev) => ({ ...prev, [key]: next }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.licenseNumber.trim()) {
      setError("Full name, email, and license number required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await api<{ data: DriverDetails }>("/api/v1/drivers", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          dateOfBirth: form.dateOfBirth || null,
          address: form.address.trim() || null,
          nationality: form.nationality.trim() || null,
          gender: form.gender || null,
          emergencyContact: form.emergencyContact.trim() || null,
          licenseNumber: form.licenseNumber.trim(),
          licenseType: form.licenseType.trim() || null,
          licenseClass: form.licenseClass.trim() || null,
          licenseIssueDate: form.licenseIssueDate || null,
          licenseExpiry: form.licenseExpiry || null,
          licenseAuthority: form.licenseAuthority.trim() || null,
          licenseRestrictions: form.licenseRestrictions.trim() || null,
          status: "ON_DUTY",
          licenseDocument: docs.licenseDocument ? "Uploaded" : "None",
          idProof: docs.idProof ? "Uploaded" : "None",
          employmentDocuments: docs.employmentDocuments ? "Uploaded" : "None",
          trainingCertificates: docs.trainingCertificates ? "Uploaded" : "None",
          medicalCertificate: docs.medicalCertificate ? "Uploaded" : "None",
          otherDocuments: docs.otherDocuments ? "Uploaded" : "None",
        }),
      });
      for (const slot of DOC_SLOTS) {
        const file = docs[slot.key];
        if (file) stashDriverDoc(res.data.id, slot.key, file);
      }
      onCreated(res.data);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add rider");
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
            aria-labelledby="new-rider-title"
            initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-t-[28px] sm:rounded-[28px] bg-white border border-slate-200 shadow-[0_28px_90px_-24px_rgba(15,23,42,0.4)]"
          >
            <div className="flex items-start justify-between gap-4 bg-sky-600 px-5 sm:px-7 pt-5 pb-5">
              <div>
                <h2
                  id="new-rider-title"
                  className="font-display text-2xl font-semibold text-white"
                >
                  New rider
                </h2>
                <p className="mt-1 text-sm text-white/85">
                  Fill profile, license, and documents.
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
              <Section title="Driver Details">
                <Field label="Full name *">
                  <input
                    required
                    className={fieldClass}
                    value={form.fullName}
                    onChange={set("fullName")}
                    placeholder="Rajesh Kumar"
                  />
                </Field>
                <Field label="Email *">
                  <input
                    required
                    type="email"
                    className={fieldClass}
                    value={form.email}
                    onChange={set("email")}
                    placeholder="rider@demo.fleet"
                  />
                </Field>
                <Field label="Phone number">
                  <input
                    className={fieldClass}
                    value={form.phone}
                    onChange={set("phone")}
                    placeholder="+91 9800011111"
                  />
                </Field>
                <Field label="Date of birth">
                  <DatePickerField
                    className={fieldClass}
                    value={form.dateOfBirth}
                    onChange={setDate("dateOfBirth")}
                  />
                </Field>
                <Field label="Address">
                  <textarea
                    className={`${fieldClass} min-h-[4.5rem] resize-y`}
                    value={form.address}
                    onChange={set("address")}
                    placeholder={"Street, City, MH\n400001"}
                  />
                </Field>
                <Field label="Nationality">
                  <input
                    className={fieldClass}
                    value={form.nationality}
                    onChange={set("nationality")}
                    placeholder="Indian"
                  />
                </Field>
                <Field label="Gender">
                  <select
                    className={fieldClass}
                    value={form.gender}
                    onChange={set("gender")}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="Emergency contact">
                  <input
                    className={fieldClass}
                    value={form.emergencyContact}
                    onChange={set("emergencyContact")}
                    placeholder="+91 9800011112"
                  />
                </Field>
              </Section>

              <Section title="License Information">
                <Field label="License number *">
                  <input
                    required
                    className={fieldClass}
                    value={form.licenseNumber}
                    onChange={set("licenseNumber")}
                    placeholder="MH1420110012345"
                  />
                </Field>
                <Field label="License type">
                  <input
                    className={fieldClass}
                    value={form.licenseType}
                    onChange={set("licenseType")}
                    placeholder="Transport"
                  />
                </Field>
                <Field label="License class">
                  <input
                    className={fieldClass}
                    value={form.licenseClass}
                    onChange={set("licenseClass")}
                    placeholder="HMV"
                  />
                </Field>
                <Field label="Issue date">
                  <DatePickerField
                    className={fieldClass}
                    value={form.licenseIssueDate}
                    onChange={setDate("licenseIssueDate")}
                  />
                </Field>
                <Field label="Expiry date">
                  <DatePickerField
                    className={fieldClass}
                    value={form.licenseExpiry}
                    onChange={setDate("licenseExpiry")}
                  />
                </Field>
                <Field label="Issuing authority">
                  <input
                    className={fieldClass}
                    value={form.licenseAuthority}
                    onChange={set("licenseAuthority")}
                    placeholder="RTO Mumbai"
                  />
                </Field>
                <Field label="License restrictions">
                  <input
                    className={fieldClass}
                    value={form.licenseRestrictions}
                    onChange={set("licenseRestrictions")}
                    placeholder="None"
                  />
                </Field>
              </Section>

              <section className="space-y-3">
                <h3 className="font-display text-sm font-semibold text-slate-900 border-b-2 border-slate-800 pb-2">
                  Documents
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  className="sr-only"
                  tabIndex={-1}
                  onChange={(e) => {
                    const picked = e.target.files?.[0];
                    const slot = pendingSlot.current;
                    e.target.value = "";
                    pendingSlot.current = null;
                    if (!picked || !slot) return;
                    void runUpload(slot, picked);
                  }}
                />
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {DOC_SLOTS.map((slot) => {
                    const file = docs[slot.key];
                    return (
                      <div
                        key={slot.key}
                        className={
                          file
                            ? "flex flex-col gap-2 rounded-2xl border-2 border-sky-300 bg-sky-50/70 px-3 py-3"
                            : "flex flex-col gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-3 py-3"
                        }
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className={
                                file
                                  ? "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-500 text-white"
                                  : "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-slate-400 border border-slate-200"
                              }
                            >
                              <FileText size={15} />
                            </span>
                            <p className="font-medium text-slate-900 text-sm leading-snug">
                              {slot.label}
                            </p>
                          </div>
                          <span
                            className={
                              file
                                ? "shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                                : "shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 border border-slate-200"
                            }
                          >
                            {file ? "Uploaded" : "None"}
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            aria-label={`View ${slot.label}`}
                            onClick={() => {
                              if (!file) return;
                              setJob({
                                key: slot.key,
                                label: slot.label,
                                fileName: file.fileName,
                                progress: 100,
                                phase: "preview",
                                file,
                              });
                            }}
                            className="grid h-7 w-7 place-items-center rounded-lg bg-white text-sky-600 border border-sky-100 hover:bg-sky-50"
                          >
                            <ViewEyeIcon />
                          </button>
                          <button
                            type="button"
                            aria-label={`Update ${slot.label}`}
                            disabled={Boolean(job)}
                            onClick={() => {
                              pendingSlot.current = slot;
                              fileInputRef.current?.click();
                            }}
                            className="grid h-7 w-7 place-items-center rounded-lg bg-white text-emerald-700 border border-emerald-100 hover:bg-emerald-50 disabled:opacity-40"
                          >
                            <Upload size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {job ? (
                  <DocUploadLayer
                    job={job}
                    onDismiss={dismissJob}
                    onRemove={() => {
                      setDocs((prev) => {
                        const old = prev[job.key];
                        if (old?.fileUrl.startsWith("blob:")) {
                          URL.revokeObjectURL(old.fileUrl);
                        }
                        const next = { ...prev };
                        delete next[job.key];
                        return next;
                      });
                      dismissJob();
                    }}
                  />
                ) : null}
              </section>

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
                    setDocs({});
                    setJob(null);
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
