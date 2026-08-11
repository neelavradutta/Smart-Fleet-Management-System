"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export function LiveMetricTile({
  label,
  icon: Icon,
  iconTint,
  bumpClass,
  bumpDownClass,
  base,
  active,
  reduce,
  intervalMs,
  firstDelayMs,
  deltaMin,
  deltaMax,
  formatValue,
  formatBump,
  min = Number.NEGATIVE_INFINITY,
  max = Number.POSITIVE_INFINITY,
}: {
  label: string;
  icon: LucideIcon;
  iconTint: string;
  bumpClass: string;
  bumpDownClass?: string;
  base: number;
  active: boolean;
  reduce: boolean | null;
  intervalMs: number;
  firstDelayMs: number;
  deltaMin: number;
  deltaMax: number;
  formatValue: (n: number) => string;
  formatBump: (delta: number) => string;
  min?: number;
  max?: number;
}) {
  const [target, setTarget] = useState(base);
  const [bump, setBump] = useState<{ id: number; delta: number } | null>(null);
  const mv = useMotionValue(base);
  const display = useTransform(mv, (v) => formatValue(Math.round(v)));

  useEffect(() => {
    setTarget(base);
    mv.set(base);
    setBump(null);
  }, [base, mv]);

  useEffect(() => {
    if (!active) return;
    const tick = () => {
      const rolled =
        deltaMin + Math.floor(Math.random() * (deltaMax - deltaMin + 1));

      setTarget((prev) => {
        let next = prev + rolled;
        if (next > max) next = max;
        if (next < min) next = min;
        const applied = next - prev;
        if (applied !== 0) {
          queueMicrotask(() => setBump({ id: Date.now(), delta: applied }));
        }
        return next;
      });
    };
    const id = window.setInterval(tick, intervalMs);
    const first = window.setTimeout(tick, firstDelayMs);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, [active, base, intervalMs, firstDelayMs, deltaMin, deltaMax, min, max]);

  useEffect(() => {
    if (reduce) {
      mv.set(target);
      return;
    }
    const ctrl = animate(mv, target, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => ctrl.stop();
  }, [target, mv, reduce]);

  const down = (bump?.delta ?? 0) < 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-center">
      <div
        className={cn(
          "mx-auto mb-2 grid h-8 w-8 place-items-center rounded-xl",
          iconTint,
        )}
      >
        <Icon size={15} />
      </div>
      <p className="text-[11px] uppercase tracking-wide text-slate-800">
        {label}
      </p>
      <motion.p className="text-lg font-semibold text-slate-900 leading-tight tabular-nums">
        {display}
      </motion.p>

      <AnimatePresence>
        {bump && !reduce ? (
          <motion.span
            key={bump.id}
            initial={{ opacity: 0, y: down ? -10 : 10, scale: 0.85 }}
            animate={{ opacity: 1, y: down ? 18 : -22, scale: 1 }}
            exit={{ opacity: 0, y: down ? 36 : -40, scale: 0.95 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() =>
              setBump((cur) => (cur?.id === bump.id ? null : cur))
            }
            className={cn(
              "pointer-events-none absolute right-2 top-9 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm",
              down ? (bumpDownClass ?? bumpClass) : bumpClass,
            )}
          >
            {formatBump(bump.delta)}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
