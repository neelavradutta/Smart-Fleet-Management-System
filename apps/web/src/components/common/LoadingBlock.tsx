"use client";

import { motion } from "framer-motion";

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-white p-8 shadow-card overflow-hidden relative">
      <span className="sf-orb left-4 top-2 h-24 w-24 bg-sky-300 opacity-40" />
      <div className="relative z-10 space-y-3">
        <div className="h-4 w-32 rounded-full bg-sky-200" />
        <div className="h-3 w-full rounded-full bg-sky-50" />
        <div className="h-3 w-2/3 rounded-full bg-emerald-50" />
        <div className="flex items-center gap-2 pt-2">
          <motion.span
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 1.1 }}
            className="w-2.5 h-2.5 rounded-full bg-sky-500"
          />
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
