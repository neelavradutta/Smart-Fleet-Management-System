"use client";

import { motion } from "framer-motion";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/common/Card";

export type LeaderDriver = {
  id: string;
  fullName: string;
  safetyScore: string | number;
  totalMiles?: number;
  status?: string;
  recentScores?: number[];
  tripsToday?: number;
  onTimePct?: number;
  incidentCount?: number;
  recentOverall?: number[];
};

const rowTint = [
  "from-amber-100 to-yellow-50 border-amber-300",
  "from-slate-100 to-slate-50 border-slate-300",
  "from-orange-100 to-amber-50 border-orange-300",
  "from-white to-slate-50 border-slate-100",
];

const medalPalette = [
  {
    rim: ["#fde68a", "#f59e0b", "#b45309"],
    face: ["#fff7cc", "#fbbf24", "#d97706"],
    ink: "#78350f",
    ribbon: ["#f59e0b", "#b45309"],
  },
  {
    rim: ["#f1f5f9", "#94a3b8", "#475569"],
    face: ["#ffffff", "#cbd5e1", "#64748b"],
    ink: "#1e293b",
    ribbon: ["#94a3b8", "#475569"],
  },
  {
    rim: ["#fdba74", "#ea580c", "#7c2d12"],
    face: ["#ffedd5", "#fb923c", "#c2410c"],
    ink: "#7c2d12",
    ribbon: ["#ea580c", "#9a3412"],
  },
] as const;

function medalStarPath(cx: number, cy: number, spikes: number, outer: number, inner: number) {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
  }
  return pts.join(" ");
}

function RankMedal({ rank }: { rank: number }) {
  const p = medalPalette[rank - 1];
  const uid = `medal-${rank}`;
  return (
    <svg
      viewBox="0 0 40 46"
      className="h-10 w-9 shrink-0 drop-shadow-sm"
      aria-label={`Rank ${rank}`}
    >
      <defs>
        <linearGradient id={`${uid}-rim`} x1="8" y1="4" x2="32" y2="40">
          <stop offset="0%" stopColor={p.rim[0]} />
          <stop offset="48%" stopColor={p.rim[1]} />
          <stop offset="100%" stopColor={p.rim[2]} />
        </linearGradient>
        <radialGradient id={`${uid}-face`} cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor={p.face[0]} />
          <stop offset="55%" stopColor={p.face[1]} />
          <stop offset="100%" stopColor={p.face[2]} />
        </radialGradient>
        <linearGradient id={`${uid}-ribbon`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.ribbon[0]} />
          <stop offset="100%" stopColor={p.ribbon[1]} />
        </linearGradient>
      </defs>
      <path
        d="M14 2h5l1 8h-7z"
        fill={`url(#${uid}-ribbon)`}
        opacity="0.95"
      />
      <path
        d="M21 2h5l1 8h-7z"
        fill={`url(#${uid}-ribbon)`}
      />
      <polygon
        points={medalStarPath(20, 26, 12, 13.6, 11.1)}
        fill={`url(#${uid}-rim)`}
      />
      <circle cx="20" cy="26" r="9.4" fill={`url(#${uid}-face)`} />
      <circle
        cx="20"
        cy="26"
        r="9.4"
        fill="none"
        stroke={p.rim[0]}
        strokeOpacity="0.55"
        strokeWidth="0.7"
      />
      <ellipse cx="17" cy="22.2" rx="4.2" ry="2.2" fill="#fff" opacity="0.35" />
      <text
        x="20"
        y="26.6"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={p.ink}
        fontSize="11"
        fontWeight="800"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {rank}
      </text>
    </svg>
  );
}

function RankMark({ rank }: { rank: number }) {
  if (rank > 3) {
    return (
      <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-[12px] font-black text-slate-500 ring-1 ring-slate-200">
        {rank}
      </span>
    );
  }
  return <RankMedal rank={rank} />;
}

function avg(values: number[]) {
  if (!values.length) return null;
  return values.reduce((s, n) => s + n, 0) / values.length;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

function stddev(values: number[]) {
  if (values.length < 2) return 0;
  const m = avg(values) ?? 0;
  const v = values.reduce((s, n) => s + (n - m) ** 2, 0) / values.length;
  return Math.sqrt(v);
}

/** Overall driver score — safety + volume + punctuality + consistency + incidents. */
export function overallScore(driver: LeaderDriver, cohort: LeaderDriver[]) {
  if (driver.status === "ON_LEAVE" && driver.recentOverall?.length) {
    return Number(driver.recentOverall.at(-1));
  }

  const safety = Number(
    driver.status === "ON_LEAVE"
      ? (driver.recentScores?.at(-1) ?? driver.safetyScore)
      : driver.safetyScore,
  );
  const onTime = Number(driver.onTimePct ?? 90);
  const maxMiles = Math.max(...cohort.map((d) => d.totalMiles ?? 0), 1);
  const activeTrips = cohort.map((d) =>
    d.status === "ON_LEAVE" || d.status === "OFFBOARDED" ? 0 : (d.tripsToday ?? 0),
  );
  const maxTrips = Math.max(...activeTrips, 1);
  const miles = ((driver.totalMiles ?? 0) / maxMiles) * 100;
  const trips =
    driver.status === "ON_LEAVE" || driver.status === "OFFBOARDED"
      ? 0
      : ((driver.tripsToday ?? 0) / maxTrips) * 100;
  const hist = (driver.recentScores ?? []).map(Number);
  const consistency = clamp(100 - stddev(hist) * 12);
  const incidents = clamp(100 - (driver.incidentCount ?? 0) * 8);

  return clamp(
    safety * 0.35 +
      onTime * 0.2 +
      miles * 0.15 +
      trips * 0.1 +
      consistency * 0.1 +
      incidents * 0.1,
  );
}

function lastReading(driver: LeaderDriver, cohort: LeaderDriver[]) {
  if (driver.recentOverall?.length) return Number(driver.recentOverall.at(-1));
  return overallScore(driver, cohort);
}

function priorFiveAvg(series: number[] | undefined, reading: number) {
  const prior = (series ?? [])
    .slice(0, -1)
    .slice(-5)
    .map(Number)
    .filter((n) => Number.isFinite(n));
  if (prior.length) return avg(prior);
  return avg([
    reading - 2.4,
    reading - 1.6,
    reading - 0.9,
    reading - 0.4,
    reading - 0.2,
  ]);
}

function TrendIcon({
  delta,
  label,
}: {
  delta: number;
  label: string;
}) {
  if (Math.abs(delta) < 0.15) {
    return (
      <Minus
        className="shrink-0 text-slate-400"
        size={18}
        strokeWidth={2.75}
        aria-label={label}
      />
    );
  }
  if (delta > 0) {
    return (
      <TrendingUp
        className="shrink-0 text-emerald-500"
        size={18}
        aria-label={label}
      />
    );
  }
  return (
    <TrendingDown
      className="shrink-0 text-rose-500"
      size={18}
      aria-label={label}
    />
  );
}

function TrendMark({
  driver,
  cohort,
}: {
  driver: LeaderDriver;
  cohort: LeaderDriver[];
}) {
  if (driver.status === "OFFBOARDED") {
    return (
      <Minus
        className="shrink-0 text-slate-400"
        size={18}
        strokeWidth={2.75}
        aria-label="No change — offboarded"
      />
    );
  }

  const series = driver.recentOverall ?? driver.recentScores;

  if (driver.status === "ON_LEAVE") {
    const reading = lastReading(driver, cohort);
    const baseline = priorFiveAvg(series, reading);
    if (baseline == null) return null;
    return (
      <TrendIcon
        delta={reading - baseline}
        label="Overall trend at last logout"
      />
    );
  }

  const current = overallScore(driver, cohort);
  const history = (series ?? []).slice(-5).map(Number);
  const baseline =
    history.length > 0 ? avg(history) : priorFiveAvg(series, current);
  if (baseline == null) return null;
  return (
    <TrendIcon delta={current - baseline} label="Overall vs last 5 average" />
  );
}

export function DriverLeaderboard({
  drivers,
  onSelect,
}: {
  drivers: LeaderDriver[];
  onSelect?: (driver: LeaderDriver) => void;
}) {
  const sorted = [...drivers].sort(
    (a, b) => overallScore(b, drivers) - overallScore(a, drivers),
  );

  return (
    <Card accent="sun" className="h-full flex flex-col overflow-hidden">
      <h2 className="font-display text-xl font-semibold text-slate-900 mb-3 shrink-0">
        Leaderboard
      </h2>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain sf-hide-scrollbar">
        {sorted.map((driver, idx) => (
          <motion.button
            key={driver.id}
            type="button"
            onClick={() => onSelect?.(driver)}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(idx, 6) * 0.06, type: "spring", stiffness: 320 }}
            whileHover={{ x: 4, scale: 1.01 }}
            className={`flex h-[calc((100%-1rem)/3)] min-h-[4.75rem] shrink-0 items-center gap-3 px-3 py-3 rounded-xl border bg-gradient-to-r text-left w-full cursor-pointer ${
              rowTint[Math.min(idx, 3)]
            }`}
          >
            <div className="w-9 flex justify-center shrink-0">
              <RankMark rank={idx + 1} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">
                {driver.fullName}
              </p>
              <p className="text-xs text-slate-500">
                {driver.totalMiles ?? 0} miles logged
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-display text-xl font-bold text-slate-900 leading-none">
                {overallScore(driver, drivers).toFixed(0)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">/100</p>
            </div>
            <TrendMark driver={driver} cohort={drivers} />
          </motion.button>
        ))}
      </div>
    </Card>
  );
}
