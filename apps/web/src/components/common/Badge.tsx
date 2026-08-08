"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

export function Badge({
  children,
  tone = "info",
  className,
  pulse,
}: {
  children: React.ReactNode;
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
  pulse?: boolean;
}) {
  const tones = {
    success: "bg-lime-100 text-lime-800 border-lime-300",
    warning: "bg-amber-100 text-amber-800 border-amber-300",
    danger: "bg-rose-100 text-rose-700 border-rose-300",
    info: "bg-sky-100 text-sky-800 border-sky-300",
    neutral: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  };

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
      {pulse ? (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-soft" />
      ) : null}
      {children}
    </motion.span>
  );
}
