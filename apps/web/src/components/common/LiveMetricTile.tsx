"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

const BUMP_S = 3.8;
const BUMP_MS = BUMP_S * 1000;

let bumpChain: Promise<void> = Promise.resolve();

function enqueueBump(play: () => boolean, cancelled: { current: boolean }) {
  const run = bumpChain.then(async () => {
    if (cancelled.current) return;
    const started = play();
    if (!started) return;
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, BUMP_MS);
    });
  });
  bumpChain = run.catch(() => undefined);
  return run;
}

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
  fx = "classic",
  hoverBar,
  hoverFilm,
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
  fx?: "classic" | "polished";
  hoverBar?: string;
  hoverFilm?: string;
}) {
  const polished = fx === "polished";
  const [target, setTarget] = useState(base);
  const [bump, setBump] = useState<{ id: number; delta: number } | null>(null);
  const mv = useMotionValue(base);
  const display = useTransform(mv, (v) => formatValue(Math.round(v)));
  const targetRef = useRef(base);
  const cancelledRef = useRef(false);

  useEffect(() => {
    targetRef.current = base;
    setTarget(base);
    mv.set(base);
    setBump(null);
  }, [base, mv]);

  useEffect(() => {
    if (!active) return;

    if (!polished) {
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
    }

    cancelledRef.current = false;
    let timer = 0;

    const applyDelta = () => {
      const rolled =
        deltaMin + Math.floor(Math.random() * (deltaMax - deltaMin + 1));
      const prev = targetRef.current;
      let next = prev + rolled;
      if (next > max) next = max;
      if (next < min) next = min;
      const applied = next - prev;
      targetRef.current = next;
      setTarget(next);
      if (applied === 0) return false;
      setBump({ id: Date.now(), delta: applied });
      return true;
    };

    const cycle = () => {
      if (cancelledRef.current) return;
      if (reduce) {
        applyDelta();
        timer = window.setTimeout(cycle, intervalMs);
        return;
      }
      void enqueueBump(applyDelta, cancelledRef).then(() => {
        if (cancelledRef.current) return;
        setBump(null);
        timer = window.setTimeout(cycle, intervalMs);
      });
    };

    timer = window.setTimeout(cycle, firstDelayMs);
    return () => {
      cancelledRef.current = true;
      window.clearTimeout(timer);
    };
  }, [
    active,
    base,
    intervalMs,
    firstDelayMs,
    deltaMin,
    deltaMax,
    min,
    max,
    reduce,
    polished,
  ]);

  useEffect(() => {
    if (reduce) {
      mv.set(target);
      return;
    }
    const ctrl = animate(mv, target, {
      duration: polished ? BUMP_S : 1.1,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => ctrl.stop();
  }, [target, mv, reduce, polished]);

  const down = (bump?.delta ?? 0) < 0;

  if (!polished) {
    const hoverFx = Boolean(hoverBar || hoverFilm);
    return (
      <div className={cn(hoverFx && "group")}>
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-center",
            hoverFx &&
              "transition-transform duration-200 ease-out group-hover:-translate-y-1",
          )}
        >
        {hoverFilm ? (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-0 w-0 transition-[width] duration-200 ease-out group-hover:w-full",
              hoverFilm,
            )}
          />
        ) : null}
        {hoverBar ? (
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute top-0 left-0 z-10 h-[3px] w-0 rounded-r-full transition-[width] duration-200 ease-out group-hover:w-full",
              hoverBar,
            )}
          />
        ) : null}
        <div
          className={cn(
            "relative z-10 mx-auto mb-2 grid h-8 w-8 place-items-center rounded-xl",
            iconTint,
          )}
        >
          <Icon size={15} />
        </div>
        <p className="relative z-10 text-[11px] uppercase tracking-wide text-slate-800">
          {label}
        </p>
        <motion.p className="relative z-10 text-lg font-semibold text-slate-900 leading-tight tabular-nums">
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
                "pointer-events-none absolute right-2 top-9 z-20 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm",
                down ? (bumpDownClass ?? bumpClass) : bumpClass,
              )}
            >
              {formatBump(bump.delta)}
            </motion.span>
          ) : null}
        </AnimatePresence>
        </div>
      </div>
    );
  }

  const hoverFx = Boolean(hoverBar || hoverFilm);

  return (
    <div className={cn(hoverFx && "group")}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70 p-3 text-center",
          hoverFx &&
            "transition-transform duration-200 ease-out group-hover:-translate-y-1",
        )}
      >
      {hoverFilm ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-0 w-0 transition-[width] duration-200 ease-out group-hover:w-full",
            hoverFilm,
          )}
        />
      ) : null}
      {hoverBar ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-0 left-0 z-10 h-[3px] w-0 rounded-r-full transition-[width] duration-200 ease-out group-hover:w-full",
            hoverBar,
          )}
        />
      ) : null}
      <AnimatePresence>
        {bump && !reduce ? (
          <motion.span
            key={`glow-${bump.id}`}
            aria-hidden
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: [0, 0.55, 0], scale: [0.9, 1.04, 1.08] }}
            exit={{ opacity: 0 }}
            transition={{ duration: BUMP_S, ease: "easeOut" }}
            className={cn(
              "pointer-events-none absolute inset-0 z-[1] rounded-2xl blur-md",
              down
                ? "bg-gradient-to-br from-rose-200/70 via-transparent to-transparent"
                : "bg-gradient-to-br from-emerald-200/70 via-transparent to-transparent",
            )}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {bump && !reduce ? (
          <motion.span
            key={`sheen-${bump.id}`}
            aria-hidden
            initial={{ x: "-120%" }}
            animate={{ x: "120%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: BUMP_S, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-y-0 z-[1] w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
          />
        ) : null}
      </AnimatePresence>

      <motion.div
        animate={
          bump && !reduce
            ? { scale: [1, 1.16, 1], rotate: [0, down ? -7 : 7, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={{ duration: BUMP_S * 0.45, ease: [0.34, 1.56, 0.64, 1] }}
        className={cn(
          "relative z-10 mx-auto mb-2 grid h-8 w-8 place-items-center rounded-xl",
          iconTint,
        )}
      >
        <Icon size={15} />
      </motion.div>
      <p className="relative z-10 text-[11px] uppercase tracking-wide text-slate-800">
        {label}
      </p>
      <motion.p
        animate={
          bump && !reduce
            ? {
                scale: [1, 1.1, 1],
                color: ["#0f172a", down ? "#e11d48" : "#059669", "#0f172a"],
              }
            : { scale: 1, color: "#0f172a" }
        }
        transition={{ duration: BUMP_S, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-lg font-semibold leading-tight tabular-nums"
      >
        {display}
      </motion.p>

      <AnimatePresence>
        {bump && !reduce ? (
          <motion.span
            key={bump.id}
            initial={{ opacity: 0, y: down ? -7 : 7, scale: 0.7, filter: "blur(4px)" }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: down ? [0, 9, 16, 28] : [0, -11, -18, -32],
              scale: [0.7, 1.12, 1.04, 0.96],
              filter: ["blur(4px)", "blur(0px)", "blur(0px)", "blur(2px)"],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: BUMP_S,
              times: [0, 0.16, 0.68, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
              "pointer-events-none absolute right-1.5 top-8 z-20 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold text-white shadow-lg ring-1 ring-white/40 backdrop-blur-[1px]",
              down ? (bumpDownClass ?? bumpClass) : bumpClass,
            )}
          >
            <motion.span
              aria-hidden
              initial={{ y: down ? -2 : 2 }}
              animate={{ y: 0 }}
              transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
              className="text-[10px] leading-none"
            >
              {down ? "▼" : "▲"}
            </motion.span>
            {formatBump(bump.delta)}
          </motion.span>
        ) : null}
      </AnimatePresence>
      </div>
    </div>
  );
}
