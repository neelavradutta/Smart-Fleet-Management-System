"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

export function Badge({
  children,
  tone = "info",
  className,
  pulse,
  dotClassName,
}: {
  children: React.ReactNode;
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
  pulse?: boolean;
  /** Override status-dot color (e.g. bg-red-500) */
  dotClassName?: string;
}) {
  const tones = {
    success: "bg-lime-100 text-lime-800 border-lime-300",
    warning: "bg-amber-100 text-amber-800 border-amber-300",
    danger: "bg-rose-100 text-rose-700 border-rose-300",
    info: "bg-sky-100 text-sky-800 border-sky-300",
    neutral: "bg-slate-100 text-slate-700 border-slate-300",
  };

  const showDot = Boolean(pulse || dotClassName);

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        tones[tone],
        className,
      )}
    >
      {showDot ? (
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
            dotClassName ?? "bg-current",
            pulse && "sf-badge-blink",
          )}
        />
      ) : null}
      {children}
    </motion.span>
  );
}
