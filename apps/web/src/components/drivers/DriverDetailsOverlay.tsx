"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Briefcase,
  CalendarCheck,
  Camera,
  ChevronDown,
  FolderOpen,
  Gauge,
  GraduationCap,
  IdCard,
  User,
  X,
} from "lucide-react";
import type { LeaderDriver } from "@/components/drivers/DriverLeaderboard";
import { missingMetric } from "@/lib/driverMetrics";

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
  performanceRating?: string | null;
  totalTrips?: string | null;
  totalDrivingHours?: string | null;
  avgTripDistance?: string | null;
  avgSpeed?: string | null;
  maxSpeed?: string | null;
  hardBrakingEvents?: string | null;
  harshAccelEvents?: string | null;
  harshCorneringEvents?: string | null;
  speedingEvents?: string | null;
  overspeedingRate?: string | null;
  accidentCount?: string | null;
  nearMissCount?: string | null;
  safetyViolations?: string | null;
  trafficViolations?: string | null;
  complaints?: string | null;
  customerRating?: string | null;
  currentAvailability?: string | null;
  workingDays?: string | null;
  daysWorked?: string | null;
  daysAbsent?: string | null;
  leaveDays?: string | null;
  lateArrivals?: string | null;
  overtimeHours?: string | null;
  lastActiveDate?: string | null;
  trainingCompleted?: string | null;
  safetyTraining?: string | null;
  defensiveDrivingTraining?: string | null;
  lastTrainingDate?: string | null;
  nextTrainingDue?: string | null;
  certificationStatus?: string | null;
  medicalFitnessStatus?: string | null;
  complianceStatus?: string | null;
  accidentHistory?: string | null;
  violationHistory?: string | null;
  warningCount?: string | null;
  disciplinaryActions?: string | null;
  incidentReports?: string | null;
  insuranceClaims?: string | null;
  lastIncidentDate?: string | null;
  incidentSeverity?: string | null;
  licenseDocument?: string | null;
  idProof?: string | null;
  employmentDocuments?: string | null;
  trainingCertificates?: string | null;
  medicalCertificate?: string | null;
  otherDocuments?: string | null;
  documentVerification?: string | null;
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
    performanceRating: "4.6 / 5",
    totalTrips: "612",
    totalDrivingHours: "418 h",
    avgTripDistance: "20.3 mi",
    avgSpeed: "29.8 mph",
    maxSpeed: "64 mph",
    hardBrakingEvents: "7",
    harshAccelEvents: "4",
    harshCorneringEvents: "3",
    speedingEvents: "5",
    overspeedingRate: "0.8%",
    accidentCount: "1",
    nearMissCount: "2",
    safetyViolations: "1",
    trafficViolations: "2",
    complaints: "1",
    customerRating: "4.5 / 5",
    currentAvailability: "Available",
    workingDays: "1,142",
    daysWorked: "1,086",
    daysAbsent: "18",
    leaveDays: "38",
    lateArrivals: "6",
    overtimeHours: "124 h",
    lastActiveDate: "12 Aug 2026",
    trainingCompleted: "8 / 8",
    safetyTraining: "Completed",
    defensiveDrivingTraining: "Completed",
    lastTrainingDate: "04 Mar 2026",
    nextTrainingDue: "04 Mar 2027",
    certificationStatus: "Valid",
    medicalFitnessStatus: "Fit",
    complianceStatus: "Compliant",
    accidentHistory: "1 minor rear-end (2024)",
    violationHistory: "2 traffic",
    warningCount: "0",
    disciplinaryActions: "None",
    incidentReports: "2",
    insuranceClaims: "1 settled",
    lastIncidentDate: "19 Nov 2024",
    incidentSeverity: "Low",
    licenseDocument: "On file",
    idProof: "Aadhaar · On file",
    employmentDocuments: "On file",
    trainingCertificates: "On file",
    medicalCertificate: "On file",
    otherDocuments: "None",
    documentVerification: "Verified",
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
    performanceRating: "4.9 / 5",
    totalTrips: "488",
    totalDrivingHours: "312 h",
    avgTripDistance: "20.1 mi",
    avgSpeed: "31.4 mph",
    maxSpeed: "58 mph",
    hardBrakingEvents: "1",
    harshAccelEvents: "0",
    harshCorneringEvents: "1",
    speedingEvents: "0",
    overspeedingRate: "0.1%",
    accidentCount: "0",
    nearMissCount: "0",
    safetyViolations: "0",
    trafficViolations: "0",
    complaints: "0",
    customerRating: "4.9 / 5",
    currentAvailability: "Off Duty",
    workingDays: "868",
    daysWorked: "842",
    daysAbsent: "8",
    leaveDays: "18",
    lateArrivals: "1",
    overtimeHours: "46 h",
    lastActiveDate: "11 Aug 2026",
    trainingCompleted: "7 / 7",
    safetyTraining: "Completed",
    defensiveDrivingTraining: "Completed",
    lastTrainingDate: "18 Jan 2026",
    nextTrainingDue: "18 Jan 2027",
    certificationStatus: "Valid",
    medicalFitnessStatus: "Fit",
    complianceStatus: "Compliant",
    accidentHistory: "None",
    violationHistory: "None",
    warningCount: "0",
    disciplinaryActions: "None",
    incidentReports: "0",
    insuranceClaims: "None",
    lastIncidentDate: "—",
    incidentSeverity: "—",
    licenseDocument: "On file",
    idProof: "Aadhaar · On file",
    employmentDocuments: "On file",
    trainingCertificates: "On file",
    medicalCertificate: "On file",
    otherDocuments: "None",
    documentVerification: "Verified",
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
    performanceRating: "4.1 / 5",
    totalTrips: "574",
    totalDrivingHours: "502 h",
    avgTripDistance: "26.5 mi",
    avgSpeed: "30.3 mph",
    maxSpeed: "72 mph",
    hardBrakingEvents: "11",
    harshAccelEvents: "8",
    harshCorneringEvents: "6",
    speedingEvents: "9",
    overspeedingRate: "1.6%",
    accidentCount: "2",
    nearMissCount: "4",
    safetyViolations: "3",
    trafficViolations: "3",
    complaints: "2",
    customerRating: "4.0 / 5",
    currentAvailability: "On Leave",
    workingDays: "1,268",
    daysWorked: "1,148",
    daysAbsent: "22",
    leaveDays: "98",
    lateArrivals: "14",
    overtimeHours: "88 h",
    lastActiveDate: "28 Jul 2026",
    trainingCompleted: "6 / 8",
    safetyTraining: "Completed",
    defensiveDrivingTraining: "Due",
    lastTrainingDate: "12 Sep 2025",
    nextTrainingDue: "12 Sep 2026",
    certificationStatus: "Valid",
    medicalFitnessStatus: "Restricted",
    complianceStatus: "Watch",
    accidentHistory: "2 (side-swipe 2023, gate bump 2025)",
    violationHistory: "3 traffic",
    warningCount: "1",
    disciplinaryActions: "Verbal warning (2025)",
    incidentReports: "4",
    insuranceClaims: "1 open",
    lastIncidentDate: "03 Dec 2025",
    incidentSeverity: "Medium",
    licenseDocument: "On file",
    idProof: "Aadhaar · On file",
    employmentDocuments: "On file",
    trainingCertificates: "Partial",
    medicalCertificate: "Restricted · On file",
    otherDocuments: "Fitness note",
    documentVerification: "Verified",
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
    performanceRating: "3.4 / 5",
    totalTrips: "986",
    totalDrivingHours: "812 h",
    avgTripDistance: "22.5 mi",
    avgSpeed: "27.3 mph",
    maxSpeed: "78 mph",
    hardBrakingEvents: "28",
    harshAccelEvents: "21",
    harshCorneringEvents: "17",
    speedingEvents: "24",
    overspeedingRate: "3.4%",
    accidentCount: "5",
    nearMissCount: "9",
    safetyViolations: "8",
    trafficViolations: "11",
    complaints: "6",
    customerRating: "3.2 / 5",
    currentAvailability: "Unavailable",
    workingDays: "1,624",
    daysWorked: "1,448",
    daysAbsent: "64",
    leaveDays: "112",
    lateArrivals: "31",
    overtimeHours: "196 h",
    lastActiveDate: "15 Jun 2026",
    trainingCompleted: "5 / 8",
    safetyTraining: "Expired",
    defensiveDrivingTraining: "Expired",
    lastTrainingDate: "08 Feb 2024",
    nextTrainingDue: "—",
    certificationStatus: "Expired",
    medicalFitnessStatus: "Lapsed",
    complianceStatus: "Non-compliant",
    accidentHistory: "5 (2 at-fault, 3 minor)",
    violationHistory: "11 traffic",
    warningCount: "4",
    disciplinaryActions: "Written warning + 2 suspensions",
    incidentReports: "9",
    insuranceClaims: "3 (2 settled, 1 denied)",
    lastIncidentDate: "02 May 2026",
    incidentSeverity: "High",
    licenseDocument: "Archived",
    idProof: "Aadhaar · Archived",
    employmentDocuments: "Archived",
    trainingCertificates: "Archived",
    medicalCertificate: "Expired",
    otherDocuments: "Exit clearance",
    documentVerification: "Archived",
  },
};

function filled(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** Seed fills gaps only. Live API / software / manual patch always win — including 0. */
export function hydrateDriver(raw: DriverDetails): DriverDetails {
  const pack = DEMO_PACKS[raw.id] ?? {};
  const merged: DriverDetails = { ...pack, ...raw };
  (Object.keys(pack) as Array<keyof DriverDetails>).forEach((key) => {
    if (missingMetric(merged[key])) {
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

              <OverlaySection
                title="Driving / Performance"
                icon={Gauge}
                iconClass="text-emerald-600"
              >
                <FieldGrid
                  rows={[
                    ["Safety Score", `${Number(d.safetyScore).toFixed(1)} / 100`],
                    ["Performance Rating", dash(d.performanceRating)],
                    [
                      "Total Miles Driven",
                      `${(d.totalMiles ?? 0).toLocaleString("en-IN")} mi`,
                    ],
                    ["Total Trips", dash(d.totalTrips)],
                    ["Total Driving Hours", dash(d.totalDrivingHours)],
                    ["Average Trip Distance", dash(d.avgTripDistance)],
                    ["Average Speed", dash(d.avgSpeed)],
                    ["Maximum Speed", dash(d.maxSpeed)],
                    ["Hard Braking Events", dash(d.hardBrakingEvents)],
                    ["Harsh Acceleration Events", dash(d.harshAccelEvents)],
                    ["Harsh Cornering Events", dash(d.harshCorneringEvents)],
                    ["Speeding Events", dash(d.speedingEvents)],
                    ["Overspeeding Rate", dash(d.overspeedingRate)],
                    [
                      "Accident Count",
                      dash(d.accidentCount) === "—"
                        ? String(d.incidentCount ?? "—")
                        : dash(d.accidentCount),
                    ],
                    ["Near-Miss Count", dash(d.nearMissCount)],
                    ["Safety Violations", dash(d.safetyViolations)],
                    ["Traffic Violations", dash(d.trafficViolations)],
                    ["Complaints", dash(d.complaints)],
                    ["Customer Rating", dash(d.customerRating)],
                  ]}
                />
              </OverlaySection>

              <OverlaySection
                title="Attendance / Availability"
                icon={CalendarCheck}
                iconClass="text-indigo-600"
              >
                <FieldGrid
                  rows={[
                    ["Current Availability", dash(d.currentAvailability)],
                    ["Working Days", dash(d.workingDays)],
                    ["Days Worked", dash(d.daysWorked)],
                    ["Days Absent", dash(d.daysAbsent)],
                    ["Leave Days", dash(d.leaveDays)],
                    ["Late Arrivals", dash(d.lateArrivals)],
                    ["Overtime Hours", dash(d.overtimeHours)],
                    ["Last Active Date", dash(d.lastActiveDate)],
                  ]}
                />
              </OverlaySection>

              <OverlaySection
                title="Training & Compliance"
                icon={GraduationCap}
                iconClass="text-fuchsia-600"
              >
                <FieldGrid
                  rows={[
                    ["Training Completed", dash(d.trainingCompleted)],
                    ["Safety Training", dash(d.safetyTraining)],
                    ["Defensive Driving Training", dash(d.defensiveDrivingTraining)],
                    ["Last Training Date", dash(d.lastTrainingDate)],
                    ["Next Training Due", dash(d.nextTrainingDue)],
                    ["Certification Status", dash(d.certificationStatus)],
                    [
                      "Medical/Fitness Certification Status",
                      dash(d.medicalFitnessStatus),
                    ],
                    ["Compliance Status", dash(d.complianceStatus)],
                  ]}
                />
              </OverlaySection>

              <OverlaySection
                title="Incidents & Records"
                icon={AlertTriangle}
                iconClass="text-rose-600"
              >
                <FieldGrid
                  rows={[
                    ["Accident History", dash(d.accidentHistory)],
                    ["Violation History", dash(d.violationHistory)],
                    ["Warning Count", dash(d.warningCount)],
                    ["Disciplinary Actions", dash(d.disciplinaryActions)],
                    ["Incident Reports", dash(d.incidentReports)],
                    ["Insurance Claims", dash(d.insuranceClaims)],
                    ["Last Incident Date", dash(d.lastIncidentDate)],
                    ["Incident Severity", dash(d.incidentSeverity)],
                  ]}
                />
              </OverlaySection>

              <OverlaySection
                title="Documents"
                icon={FolderOpen}
                iconClass="text-teal-600"
              >
                <FieldGrid
                  rows={[
                    ["License Document", dash(d.licenseDocument)],
                    ["ID Proof", dash(d.idProof)],
                    ["Employment Documents", dash(d.employmentDocuments)],
                    ["Training Certificates", dash(d.trainingCertificates)],
                    ["Medical Certificate", dash(d.medicalCertificate)],
                    ["Other Documents", dash(d.otherDocuments)],
                    [
                      "Document Verification Status",
                      dash(d.documentVerification),
                    ],
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
