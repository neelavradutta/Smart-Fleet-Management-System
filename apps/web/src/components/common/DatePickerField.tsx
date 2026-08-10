"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { format, isValid, parse } from "date-fns";
import { Calendar } from "lucide-react";
import { cn } from "@/utils/cn";
import "react-day-picker/style.css";

function parseValue(value: string): Date | undefined {
  if (!value) return undefined;
  const d = parse(value, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

export function DatePickerField({
  value,
  onChange,
  className,
  placeholder = "Select date",
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const selected = parseValue(value);

  useEffect(() => setMounted(true), []);

  const updatePos = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const popW = Math.max(r.width, 320);
    const left = Math.min(
      Math.max(8, r.left),
      window.innerWidth - popW - 8,
    );
    const below = r.bottom + 8;
    const estimatedH = 360;
    const top =
      below + estimatedH > window.innerHeight - 8
        ? Math.max(8, r.top - estimatedH - 8)
        : below;
    setPos({ top, left, width: popW });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
    const onScroll = () => updatePos();
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  const label = selected ? format(selected, "d MMM yyyy") : placeholder;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-date-picker-open={open ? "true" : "false"}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          className,
          "flex items-center justify-between gap-2 text-left",
          !selected && "text-slate-400",
        )}
      >
        <span className="truncate">{label}</span>
        <Calendar size={16} className="shrink-0 text-slate-500" />
      </button>

      {mounted && open
        ? createPortal(
            <div
              ref={popoverRef}
              role="dialog"
              aria-label="Choose date"
              className="fixed z-[120] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.45)]"
              style={{ top: pos.top, left: pos.left, width: pos.width }}
            >
              <DayPicker
                mode="single"
                selected={selected}
                defaultMonth={selected ?? new Date()}
                captionLayout="dropdown"
                startMonth={new Date(1990, 0)}
                endMonth={new Date(2045, 11)}
                onSelect={(day) => {
                  onChange(day ? format(day, "yyyy-MM-dd") : "");
                  setOpen(false);
                }}
                className="rdp-root mx-auto [--rdp-accent-color:#0ea5e9] [--rdp-accent-background-color:#e0f2fe] [--rdp-day-height:36px] [--rdp-day-width:36px] [--rdp-day_button-height:34px] [--rdp-day_button-width:34px]"
              />
              <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                <button
                  type="button"
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50"
                  onClick={() => {
                    onChange(format(new Date(), "yyyy-MM-dd"));
                    setOpen(false);
                  }}
                >
                  Today
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
