"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { hoverLift } from "@/lib/motion";

type Accent =
  | "sky"
  | "mint"
  | "sun"
  | "coral"
  | "lilac"
  | "fuchsia"
  | "lime"
  | "teal"
  | "orange"
  | "tan"
  | "none";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  glow?: boolean;
  accent?: Accent;
};

const accentStyles: Record<
  Accent,
  { border: string; bar: string; blob: string }
> = {
  sky: {
    border: "border-sky-200 hover:shadow-soft",
    bar: "bg-sky-500",
    blob: "bg-sky-300",
  },
  mint: {
    border: "border-emerald-200 hover:shadow-mint",
    bar: "bg-emerald-500",
    blob: "bg-emerald-300",
  },
  sun: {
    border: "border-amber-200 hover:shadow-sun",
    bar: "bg-amber-500",
    blob: "bg-amber-300",
  },
  coral: {
    border: "border-rose-200 hover:shadow-coral",
    bar: "bg-rose-500",
    blob: "bg-rose-300",
  },
  lilac: {
    border: "border-violet-200",
    bar: "bg-violet-500",
    blob: "bg-violet-300",
  },
  fuchsia: {
    border: "border-fuchsia-200",
    bar: "bg-fuchsia-500",
    blob: "bg-fuchsia-300",
  },
  lime: {
    border: "border-lime-200",
    bar: "bg-lime-500",
    blob: "bg-lime-300",
  },
  teal: {
    border: "border-[#a7e8d1] hover:shadow-soft",
    bar: "bg-[#1CB07E]",
    blob: "bg-[#1CB07E]/30",
  },
  orange: {
    border: "border-orange-200",
    bar: "bg-orange-500",
    blob: "bg-orange-300",
  },
  tan: {
    border: "border-tan-200 hover:shadow-tan",
    bar: "bg-tan-700",
    blob: "bg-tan-200",
  },
  none: {
    border: "border-slate-200/80",
    bar: "",
    blob: "",
  },
};

export function Card({
  className,
  hover,
  glow,
  accent = "none",
  children,
  ...props
}: CardProps) {
  const a = accentStyles[accent];
  const classes = cn(
    "relative overflow-hidden rounded-2xl border bg-white p-6 shadow-card",
    a.border,
    glow && "border-sky-200 shadow-soft",
    className,
  );

  const decor =
    accent !== "none" ? (
      <>
        <span className={cn("absolute top-0 left-0 right-0 h-1", a.bar)} />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl opacity-35",
            a.blob,
          )}
        />
      </>
    ) : null;

  if (hover) {
    return (
      <motion.div className={classes} {...hoverLift} {...(props as object)}>
        {decor}
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classes} {...props}>
      {decor}
      {children}
    </div>
  );
}
