"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import type { LeaderDriver } from "@/components/drivers/DriverLeaderboard";
import { missingMetric, patchDriver } from "@/lib/driverMetrics";

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
  nationality?: string | null;
  gender?: string | null;
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
    nationality: "Indian",
    gender: "Male",
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
    licenseDocument: "None",
    idProof: "None",
    employmentDocuments: "None",
    trainingCertificates: "None",
    medicalCertificate: "None",
    otherDocuments: "None",
    documentVerification: "Verified",
  },
  "33333333-3333-3333-3333-333333333332": {
    driverCode: "DRV-1002",
    employeeId: "EMP-1088",
    dateOfBirth: "02 Nov 1992",
    nationality: "Indian",
    gender: "Female",
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
    licenseDocument: "None",
    idProof: "None",
    employmentDocuments: "None",
    trainingCertificates: "None",
    medicalCertificate: "None",
    otherDocuments: "None",
    documentVerification: "Verified",
  },
  "33333333-3333-3333-3333-333333333333": {
    driverCode: "DRV-1003",
    employeeId: "EMP-1142",
    dateOfBirth: "27 Jul 1985",
    nationality: "Indian",
    gender: "Male",
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
    licenseDocument: "None",
    idProof: "None",
    employmentDocuments: "None",
    trainingCertificates: "None",
    medicalCertificate: "None",
    otherDocuments: "None",
    documentVerification: "Verified",
  },
  "33333333-3333-3333-3333-333333333334": {
    driverCode: "DRV-1004",
    employeeId: "EMP-0961",
    dateOfBirth: "05 Jan 1980",
    nationality: "Indian",
    gender: "Male",
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
    licenseDocument: "None",
    idProof: "None",
    employmentDocuments: "None",
    trainingCertificates: "None",
    medicalCertificate: "None",
    otherDocuments: "None",
    documentVerification: "None",
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
    },
  },
  exit: {
    opacity: 0,
    y: 28,
    scale: 0.96,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
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
    <section>
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
    </section>
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

type DocSlotKey =
  | "licenseDocument"
  | "idProof"
  | "employmentDocuments"
  | "trainingCertificates"
  | "medicalCertificate"
  | "otherDocuments";

const DOC_SLOTS: Array<{ key: DocSlotKey; label: string }> = [
  { key: "licenseDocument", label: "License Document" },
  { key: "idProof", label: "ID Proof" },
  { key: "employmentDocuments", label: "Employment Documents" },
  { key: "trainingCertificates", label: "Training Certificates" },
  { key: "medicalCertificate", label: "Medical Certificate" },
  { key: "otherDocuments", label: "Other Documents" },
];

export type DocFile = { fileName: string; fileUrl: string; mime: string };

const docMemory = new Map<string, DocFile>();

function docMemKey(driverId: string, key: string) {
  return `${driverId}:${key}`;
}

export function stashDriverDoc(driverId: string, key: string, file: DocFile) {
  const prev = docMemory.get(docMemKey(driverId, key));
  if (prev?.fileUrl.startsWith("blob:")) URL.revokeObjectURL(prev.fileUrl);
  docMemory.set(docMemKey(driverId, key), file);
}

export function DocFilePreview({
  label,
  file,
}: {
  label: string;
  file: DocFile;
}) {
  if (file.mime.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={file.fileUrl}
        alt={label}
        className="w-full rounded-xl border border-slate-200 object-contain max-h-[56vh]"
      />
    );
  }
  if (file.mime === "application/pdf") {
    return (
      <iframe
        title={label}
        src={file.fileUrl}
        className="w-full h-[56vh] rounded-xl border border-slate-200"
      />
    );
  }
  return (
    <a
      href={file.fileUrl}
      target="_blank"
      rel="noreferrer"
      className="inline-flex text-sm font-medium text-emerald-700 hover:underline"
    >
      Open {file.fileName}
    </a>
  );
}

export function DocUploadLayer({
  job,
  onDismiss,
  onRemove,
}: {
  job: {
    label: string;
    fileName: string;
    progress: number;
    phase: "uploading" | "failed" | "preview";
    file?: DocFile;
  };
  onDismiss: () => void;
  onRemove: () => void;
}) {
  useEffect(() => {
    if (job.phase === "failed") {
      const t = window.setTimeout(onDismiss, 1300);
      return () => window.clearTimeout(t);
    }
  }, [job.phase, onDismiss]);

  return createPortal(
    <div className="fixed inset-0 z-[230] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50"
        aria-hidden
        onClick={job.phase === "preview" ? onDismiss : undefined}
      />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xl">
        {job.phase === "preview" && job.file ? (
          <>
            <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-100">
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold text-slate-900 truncate">
                  {job.label}
                </p>
                <p className="text-xs text-emerald-700 truncate">Uploaded · {job.fileName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={onRemove}
                  aria-label={`Remove ${job.label}`}
                  className="grid h-8 w-8 place-items-center rounded-full text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 size={15} />
                </button>
                <button
                  type="button"
                  onClick={onDismiss}
                  aria-label="Back to driver details"
                  className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <DocFilePreview label={job.label} file={job.file} />
            </div>
          </>
        ) : (
          <div className="px-6 py-7">
            <p
              className={
                job.phase === "failed"
                  ? "font-display text-xl font-semibold text-rose-600"
                  : "font-display text-xl font-semibold text-slate-900"
              }
            >
              {job.phase === "failed" ? "Failed" : "Uploading…"}
            </p>
            <p className="mt-1.5 text-sm text-slate-500 truncate">
              {job.label} · {job.fileName}
            </p>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={
                  job.phase === "failed" ? "h-full bg-rose-500" : "h-full bg-emerald-500"
                }
                style={{
                  width: `${Math.max(job.progress, job.phase === "uploading" ? 6 : 0)}%`,
                  transition: "width 160ms linear",
                }}
              />
            </div>
            <p
              className={
                job.phase === "failed"
                  ? "mt-3 text-sm font-medium text-rose-600"
                  : "mt-3 text-sm font-medium text-slate-600"
              }
            >
              {job.phase === "failed" ? "Failed" : `${job.progress}%`}
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function ViewEyeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M2.4 12s3.7-6.6 9.6-6.6S21.6 12 21.6 12s-3.7 6.6-9.6 6.6S2.4 12 2.4 12Z"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.35" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" />
    </svg>
  );
}

function DocumentsPanel({ driver }: { driver: DriverDetails }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingSlot = useRef<(typeof DOC_SLOTS)[number] | null>(null);
  const [rev, setRev] = useState(0);
  const [preview, setPreview] = useState<{
    key: DocSlotKey;
    label: string;
    status: string;
    file?: DocFile;
  } | null>(null);
  const [job, setJob] = useState<{
    key: DocSlotKey;
    label: string;
    fileName: string;
    progress: number;
    phase: "uploading" | "failed" | "preview";
    file?: DocFile;
  } | null>(null);
  void rev;
  const dismissJob = useCallback(() => setJob(null), []);

  async function runUpload(slot: (typeof DOC_SLOTS)[number], file: File) {
    setPreview(null);
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
      await Promise.all([
        patchDriver(driver.id, {
          source: "manual",
          [slot.key]: "Uploaded",
        }),
        new Promise((resolve) => window.setTimeout(resolve, 1500)),
      ]);
      const prev = docMemory.get(docMemKey(driver.id, slot.key));
      if (prev?.fileUrl.startsWith("blob:")) URL.revokeObjectURL(prev.fileUrl);
      const stored: DocFile = {
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        mime: file.type || "application/octet-stream",
      };
      docMemory.set(docMemKey(driver.id, slot.key), stored);
      setRev((n) => n + 1);
      clearInterval(tick);
      setJob((j) =>
        j
          ? { ...j, progress: 100, phase: "preview", file: stored }
          : j,
      );
    } catch {
      clearInterval(tick);
      setJob((j) => (j ? { ...j, phase: "failed", progress: 100 } : j));
    }
  }

  return (
    <>
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
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        {DOC_SLOTS.map((slot) => {
          const file = docMemory.get(docMemKey(driver.id, slot.key));
          const status =
            file || driver[slot.key] === "Uploaded" ? "Uploaded" : "None";
          return (
            <div key={slot.key} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-500 shrink-0">{slot.label}</span>
              <span className="flex min-w-0 items-center justify-end gap-1.5">
                <span className="font-medium text-slate-900 truncate">{status}</span>
                <button
                  type="button"
                  aria-label={`View ${slot.label}`}
                  onClick={() =>
                    setPreview({
                      key: slot.key,
                      label: slot.label,
                      status,
                      file,
                    })
                  }
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                >
                  <ViewEyeIcon />
                </button>
                <button
                  type="button"
                  aria-label={`Update ${slot.label}`}
                  disabled={Boolean(job)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    pendingSlot.current = slot;
                    fileInputRef.current?.click();
                  }}
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                >
                  <Upload size={14} />
                </button>
              </span>
            </div>
          );
        })}
      </div>

      {job ? (
        <DocUploadLayer
          job={job}
          onDismiss={dismissJob}
          onRemove={() => {
            const mem = docMemory.get(docMemKey(driver.id, job.key));
            if (mem?.fileUrl.startsWith("blob:")) URL.revokeObjectURL(mem.fileUrl);
            docMemory.delete(docMemKey(driver.id, job.key));
            setRev((n) => n + 1);
            void patchDriver(driver.id, {
              source: "manual",
              [job.key]: "None",
            });
            dismissJob();
          }}
        />
      ) : null}

      <AnimatePresence>
        {preview ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] flex items-center justify-center p-4"
          >
            <button
              type="button"
              aria-label="Close document preview"
              className="absolute inset-0 bg-slate-900/50"
              onClick={() => setPreview(null)}
            />
            <motion.div
              initial={{ y: 16, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 12, scale: 0.98 }}
              className="relative z-10 w-full max-w-lg max-h-[84vh] overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xl"
            >
              <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-slate-100">
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold text-slate-900 truncate">
                    {preview.label}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {preview.file?.fileName ?? preview.status}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Remove ${preview.label}`}
                    onClick={() => {
                      const mem = docMemory.get(docMemKey(driver.id, preview.key));
                      if (mem?.fileUrl.startsWith("blob:")) {
                        URL.revokeObjectURL(mem.fileUrl);
                      }
                      docMemory.delete(docMemKey(driver.id, preview.key));
                      setRev((n) => n + 1);
                      void patchDriver(driver.id, {
                        source: "manual",
                        [preview.key]: "None",
                      });
                      setPreview(null);
                    }}
                    className="grid h-8 w-8 place-items-center rounded-full text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    aria-label="Close"
                    className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(84vh-4rem)]">
                {preview.file ? (
                  <DocFilePreview label={preview.label} file={preview.file} />
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
                    <p className="font-display text-lg font-semibold text-slate-900">
                      {preview.label}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">{driver.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {dash(driver.driverCode)} · {dash(driver.employeeId)}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

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
  const [settled, setSettled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      setSettled(false);
      return;
    }
    const id = window.setTimeout(() => setSettled(true), 400);
    return () => window.clearTimeout(id);
  }, [open]);

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

  return createPortal(
    <AnimatePresence>
      {open && d ? (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="driver-detail-title"
            variants={reduce ? undefined : panelVariants}
            initial={settled || reduce ? false : "hidden"}
            animate="visible"
            exit="exit"
            onMouseDown={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-t-[28px] sm:rounded-[28px] bg-white border border-slate-200 shadow-[0_28px_90px_-24px_rgba(15,23,42,0.4)]"
          >
            <div className="relative bg-emerald-600 px-5 sm:px-7 pt-5 pb-6">
              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0 flex items-center gap-3">
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
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close driver details"
                  className="shrink-0 grid place-items-center h-10 w-10 rounded-full bg-white/20 text-white hover:bg-white/30"
                >
                  <X size={18} />
                </button>
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
                    ["Nationality", dash(d.nationality)],
                    ["Gender", dash(d.gender)],
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
                <DocumentsPanel driver={d} />
              </OverlaySection>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
