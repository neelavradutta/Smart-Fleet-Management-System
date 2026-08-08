"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/utils/cn";

export function AnimatedNumber({
  value,
  decimals = 0,
  className,
  flash,
}: {
  value: number;
  decimals?: number;
  className?: string;
  flash?: boolean;
}) {
  const motionValue = useMotionValue(value);
  const rounded = useTransform(motionValue, (latest) =>
    Number(latest).toFixed(decimals),
  );
  const [display, setDisplay] = useState(value.toFixed(decimals));
  const [bump, setBump] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    if (prev.current !== value) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 450);
      prev.current = value;
      return () => {
        controls.stop();
        unsub();
        clearTimeout(t);
      };
    }
    prev.current = value;
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, decimals, motionValue, rounded]);

  return (
    <motion.span
      animate={
        bump && flash
          ? { scale: [1, 1.08, 1], y: [0, -2, 0] }
          : { scale: 1, y: 0 }
      }
      transition={{ duration: 0.35 }}
      className={cn("tabular-nums inline-block", className)}
    >
      {display}
    </motion.span>
  );
}
