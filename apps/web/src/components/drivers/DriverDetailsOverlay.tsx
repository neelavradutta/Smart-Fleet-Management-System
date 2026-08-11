"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Camera,
  ChevronDown,
  IdCard,
  User,
  X,
} from "lucide-react";
import type { LeaderDriver } from "@/components/drivers/DriverLeaderboard";

export const DRIVER_STATUS: Record<
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

export type DriverDetails = LeaderDriver & {
  email: string;
  phone: string | null;
  licenseNumber: string;
  status: string;
  tripsToday?: number;
  driverCode?: string | null;
  employeeId?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  profileCreatedAt?: string | null;
  licenseType?: string | null;
  licenseClass?: string | null;
  licenseIssueDate?: string | null;
  licenseExpiry?: string | null;
  licenseAuthority?: string | null;
  licenseStatus?: string | null;
  licenseVerification?: string | null;
  licenseRestrictions?: string | null;
  employmentType?: string | null;
  joiningDate?: string | null;
  department?: string | null;
  assignedBranch?: string | null;
  supervisor?: string | null;
  shift?: string | null;
  reasonForLeaving?: string | null;
  leavingDate?: string | null;
  photoUrl?: string | null;
};

const DEMO_PACKS: Record<string, Partial<DriverDetails>> = {
  "33333333-3333-3333-3333-333333333331": {
    driverCode: "DRV-1001",
    employeeId: "EMP-1024",
    dateOfBirth: "14 Mar 1988",
    address: "12/4 Andheri East, Mumbai, MH\n400069",
    emergencyContact: "+91 9800011112",
    profileCreatedAt: "12 Jan 2022",
    licenseType: "Transport",
    licenseClass: "HMV",
    licenseIssueDate: "22 Jun 2011",
    licenseExpiry: "21 Jun 2031",
    licenseAuthority: "RTO Andheri, Mumbai",
    licenseStatus: "Valid",
    licenseVerification: "Verified",
    licenseRestrictions: "Corrective lenses",
    employmentType: "Full-time",
    joiningDate: "12 Jan 2022",
    department: "Operations",
    assignedBranch: "Andheri Hub",
    supervisor: "Meera Joshi",
    shift: "Morning · 06:00–14:00",
  },
  "33333333-3333-3333-3333-333333333332": {
    driverCode: "DRV-1002",
    employeeId: "EMP-1088",
    dateOfBirth: "02 Nov 1992",
    address: "88 Bandra West, Mumbai, MH\n400050",
    emergencyContact: "+91 9800022223",
    profileCreatedAt: "03 Mar 2023",
    licenseType: "Transport",
    licenseClass: "LMV + HMV",
    licenseIssueDate: "09 Sep 2015",
    licenseExpiry: "08 Sep 2035",
    licenseAuthority: "RTO Bandra, Mumbai",
    licenseStatus: "Valid",
    licenseVerification: "Verified",
    licenseRestrictions: "None",
    employmentType: "Full-time",
    joiningDate: "03 Mar 2023",
    department: "Operations",
    assignedBranch: "Bandra Depot",
    supervisor: "Meera Joshi",
    shift: "Evening · 14:00–22:00",
  },
  "33333333-3333-3333-3333-333333333333": {
    driverCode: "DRV-1003",
    employeeId: "EMP-1142",
    dateOfBirth: "27 Jul 1985",
    address: "41 Viman Nagar, Pune, MH\n411014",
    emergencyContact: "+91 9800033334",
    profileCreatedAt: "18 Aug 2021",
    licenseType: "Transport",
    licenseClass: "HMV",
    licenseIssueDate: "14 Feb 2018",
    licenseExpiry: "13 Feb 2028",
    licenseAuthority: "RTO Pune",
    licenseStatus: "Valid",
    licenseVerification: "Verified",
    licenseRestrictions: "No night driving (medical)",
    employmentType: "Full-time",
    joiningDate: "18 Aug 2021",
    department: "Long haul",
    assignedBranch: "Pune Yard",
    supervisor: "Arjun Desai",
    shift: "Rotating",
  },
  "33333333-3333-3333-3333-333333333334": {
    driverCode: "DRV-1004",
    employeeId: "EMP-0961",
    dateOfBirth: "05 Jan 1980",
    address: "6 Thane West, Thane, MH\n400601",
    emergencyContact: "+91 9800044445",
    profileCreatedAt: "09 Feb 2020",
    licenseType: "Transport",
    licenseClass: "HMV",
    licenseIssueDate: "30 Apr 2010",
    licenseExpiry: "29 Apr 2030",
    licenseAuthority: "RTO Thane",
    licenseStatus: "Surrendered",
    licenseVerification: "Archived",
    licenseRestrictions: "None",
    employmentType: "Full-time",
    joiningDate: "09 Feb 2020",
    department: "Operations",
    assignedBranch: "Thane Depot",
    supervisor: "Meera Joshi",
    shift: "—",
    reasonForLeaving: "Resigned — personal reasons",
    leavingDate: "15 Jun 2026",
  },
};

function filled(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** API fields win. Missing personal/license/employment filled from demo pack. */
export function hydrateDriver(raw: DriverDetails): DriverDetails {
  const pack = DEMO_PACKS[raw.id] ?? {};
  const merged: DriverDetails = { ...pack, ...raw };
  (Object.keys(pack) as Array<keyof DriverDetails>).forEach((key) => {
    if (!filled(merged[key] as unknown)) {
      (merged as Record<string, unknown>)[key as string] = pack[key];
    }
  });
  return merged;
}

const panelVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 26,
      staggerChildren: 0.055,
      delayChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: 28,
    scale: 0.96,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
  },
};

const child = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 320, damping: 24 },
  },
};

function OverlaySection({
  title,
  icon: Icon,
  iconClass,
  children,
}: {
  title: string;
  icon: LucideIcon;
  iconClass: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <motion.section variants={child}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mb-3 flex w-full items-center gap-2 text-left"
      >
        <Icon size={15} className={iconClass} />
        <span className="font-display text-sm font-semibold text-slate-900 flex-1">
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}

function FieldGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 rounded-2xl border border-slate-200 bg-white p-4">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-3 text-sm">
          <span className="text-slate-500 shrink-0">{k}</span>
          <span className="font-medium text-slate-900 text-right whitespace-pre-line break-words">
            {v || "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

function dash(value?: string | null) {
  return filled(value) ? value : "—";
}

/** +91 then one space, digits packed. */
function formatPhone(value?: string | null) {
  if (!filled(value)) return "—";
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length > 2) {
    return `+91 ${digits.slice(2)}`;
  }
  if (digits.length === 10) return `+91 ${digits}`;
  return value.replace(/\s+/g, " ").replace(/^(\+91)\s*/, "+91 ").replace(/(\+91 \d+)\s+/g, "$1");
}

function cleanEmergency(value?: string | null) {
  if (!filled(value)) return "—";
  const parts = value.split("·").map((s) => s.trim()).filter(Boolean);
  return parts[parts.length - 1] ?? "—";
}

function formatAddress(value?: string | null) {
  if (!filled(value)) return "—";
  if (value.includes("\n")) return value;
  const m = value.match(/^(.*?)[,\s]+(\d{6})\s*$/);
  if (m) return `${m[1].replace(/[,\s]+$/, "")}\n${m[2]}`;
  return value;
}

const photoMemory = new Map<string, string>();

function DriverPhotoSlot({
  name,
  photoUrl,
  onPick,
}: {
  name: string;
  photoUrl?: string | null;
  onPick: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      aria-label="Set driver photo"
      className="relative shrink-0 h-[4.5rem] w-[4.5rem] overflow-hidden rounded-md border-2 border-white/80 bg-white/15 text-white hover:bg-white/25"
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <>
          <span className="grid h-full w-full place-items-center font-display text-lg font-semibold">
            {initials || <User size={22} />}
          </span>
          <span className="absolute bottom-1 right-1 grid h-5 w-5 place-items-center rounded-sm bg-black/35">
            <Camera size={11} />
          </span>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onPick(URL.createObjectURL(file));
        }}
      />
    </button>
  );
}

export function DriverDetailsOverlay({
  open,
  driver,
  onClose,
}: {
  open: boolean;
  driver: DriverDetails | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!driver) {
      setPhotoUrl(null);
      return;
    }
    setPhotoUrl(photoMemory.get(driver.id) ?? driver.photoUrl ?? null);
  }, [driver]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const d = driver;
  const meta = d ? DRIVER_STATUS[d.status] ?? { label: d.status, tone: "neutral" as const } : null;

  return createPortal(
    <AnimatePresence>
      {open && d ? (
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
            aria-labelledby="driver-detail-title"
            variants={reduce ? undefined : panelVariants}
            initial={reduce ? false : "hidden"}
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-t-[28px] sm:rounded-[28px] bg-white border border-slate-200 shadow-[0_28px_90px_-24px_rgba(15,23,42,0.4)]"
          >
            <div className="relative bg-emerald-600 px-5 sm:px-7 pt-5 pb-6">
              <div className="relative flex items-start justify-between gap-4">
                <motion.div
                  variants={child}
                  className="min-w-0 flex items-center gap-3"
                >
                  <DriverPhotoSlot
                    name={d.fullName}
                    photoUrl={photoUrl}
                    onPick={(url) => {
                      photoMemory.set(d.id, url);
                      setPhotoUrl(url);
                    }}
                  />
                  <div className="min-w-0">
                    <h2
                      id="driver-detail-title"
                      className="font-display text-2xl sm:text-3xl font-semibold text-white truncate"
                    >
                      {d.fullName}
                    </h2>
                    <p className="mt-1 text-sm text-white/90">
                      {dash(d.employeeId)} · {dash(d.department)}
                    </p>
                  </div>
                </motion.div>
                <motion.button
                  variants={child}
                  type="button"
                  whileHover={{ rotate: 90, scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={onClose}
                  aria-label="Close driver details"
                  className="shrink-0 grid place-items-center h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
                >
                  <X size={18} />
                </motion.button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(92vh-8.5rem)] px-5 sm:px-7 py-5 space-y-5 sf-hide-scrollbar">
              <OverlaySection
                title="Driver Details"
                icon={User}
                iconClass="text-violet-600"
              >
                <FieldGrid
                  rows={[
                    ["Full Name", d.fullName],
                    ["Driver ID", dash(d.driverCode) === "—" ? d.id : dash(d.driverCode)],
                    ["Employee ID", dash(d.employeeId)],
                    ["Email", d.email],
                    ["Phone Number", formatPhone(d.phone)],
                    ["Date of Birth", dash(d.dateOfBirth)],
                    ["Address", formatAddress(d.address)],
                    ["Emergency Contact", formatPhone(cleanEmergency(d.emergencyContact))],
                    ["Profile Created Date", dash(d.profileCreatedAt)],
                  ]}
                />
              </OverlaySection>

              <OverlaySection
                title="License Information"
                icon={IdCard}
                iconClass="text-sky-600"
              >
                <FieldGrid
                  rows={[
                    ["License Number", d.licenseNumber],
                    ["License Type", dash(d.licenseType)],
                    ["License Class", dash(d.licenseClass)],
                    ["Issue Date", dash(d.licenseIssueDate)],
                    ["Expiry Date", dash(d.licenseExpiry)],
                    ["Issuing Authority", dash(d.licenseAuthority)],
                    ["License Status", dash(d.licenseStatus)],
                    ["License Verification Status", dash(d.licenseVerification)],
                    ["License Restrictions", dash(d.licenseRestrictions)],
                  ]}
                />
              </OverlaySection>

              <OverlaySection
                title="Employment Information"
                icon={Briefcase}
                iconClass="text-amber-600"
              >
                <FieldGrid
                  rows={[
                    ["Employment Type", dash(d.employmentType)],
                    ["Joining Date", dash(d.joiningDate)],
                    ["Department", dash(d.department)],
                    ["Assigned Branch", dash(d.assignedBranch)],
                    ["Supervisor / Manager", dash(d.supervisor)],
                    ["Shift", dash(d.shift)],
                    ["Current Status", meta?.label ?? d.status],
                    ["Reason for Leaving", dash(d.reasonForLeaving)],
                    ["Leaving Date", dash(d.leavingDate)],
                  ]}
                />
              </OverlaySection>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
