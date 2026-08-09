"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const themes = {
  sky: {
    wrap: "bg-sky-100 border-sky-200",
    title: "text-sky-800",
    chip: "bg-sky-200 text-sky-900 border-sky-300",
    blob: "bg-sky-300/50",
  },
  mint: {
    wrap: "bg-emerald-100 border-emerald-200",
    title: "text-emerald-800",
    chip: "bg-emerald-200 text-emerald-900 border-emerald-300",
    blob: "bg-emerald-300/50",
  },
  sun: {
    wrap: "bg-amber-100 border-amber-200",
    title: "text-amber-900",
    chip: "bg-amber-200 text-amber-900 border-amber-300",
    blob: "bg-amber-300/50",
  },
  coral: {
    wrap: "bg-rose-100 border-rose-200",
    title: "text-rose-800",
    chip: "bg-rose-200 text-rose-900 border-rose-300",
    blob: "bg-rose-300/50",
  },
  lilac: {
    wrap: "bg-violet-100 border-violet-200",
    title: "text-violet-800",
    chip: "bg-violet-200 text-violet-900 border-violet-300",
    blob: "bg-violet-300/50",
  },
  lime: {
    wrap: "bg-lime-100 border-lime-200",
    title: "text-lime-800",
    chip: "bg-lime-200 text-lime-900 border-lime-300",
    blob: "bg-lime-300/50",
  },
  teal: {
    wrap: "bg-[#e8f8f2] border-[#a7e8d1]",
    title: "text-[#0d6e52]",
    chip: "bg-[#ccf7e8] text-[#0d6e52] border-[#a7e8d1]",
    blob: "bg-[#1CB07E]/35",
  },
  orange: {
    wrap: "bg-orange-100 border-orange-200",
    title: "text-orange-800",
    chip: "bg-orange-200 text-orange-900 border-orange-300",
    blob: "bg-orange-300/50",
  },
  fuchsia: {
    wrap: "bg-fuchsia-100 border-fuchsia-200",
    title: "text-fuchsia-800",
    chip: "bg-fuchsia-200 text-fuchsia-900 border-fuchsia-300",
    blob: "bg-fuchsia-300/50",
  },
};

export function PageHero({
  title,
  subtitle,
  chip,
  theme = "sky",
  children,
}: {
  title: string;
  subtitle?: string;
  chip?: string;
  theme?: keyof typeof themes;
  children?: React.ReactNode;
}) {
  const t = themes[theme];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border p-5 sm:p-6 mb-6 shadow-card",
        t.wrap,
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full blur-2xl",
          t.blob,
        )}
      />

      <div className="relative z-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          {chip ? (
            <span
              className={cn(
                "inline-flex mb-2 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                t.chip,
              )}
            >
              {chip}
            </span>
          ) : null}
          <h1
            className={cn(
              "font-display text-3xl sm:text-4xl font-semibold tracking-tight",
              t.title,
            )}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="text-slate-600 mt-1 max-w-2xl">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </motion.div>
  );
}
