"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { createPortal } from "react-dom";
import { DayPicker, type DropdownProps } from "react-day-picker";
import { format, isValid, parse } from "date-fns";
import { Calendar, ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";
import "react-day-picker/style.css";

const OPEN_EVENT = "sf-datepicker-open";
const DROPDOWN_EVENT = "sf-datepicker-dropdown-open";
let pickerSeq = 0;
let dropdownSeq = 0;

function parseValue(value: string): Date | undefined {
  if (!value) return undefined;
  const d = parse(value, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
}

/** Custom month/year menu — replaces native <select> look. */
function PolishedDropdown({
  options,
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const idRef = useRef(`dd-${++dropdownSeq}`);
  const selected = options?.find((o) => o.value === Number(value));

  useEffect(() => {
    const onOther = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id !== idRef.current) setOpen(false);
    };
    window.addEventListener(DROPDOWN_EVENT, onOther);
    return () => window.removeEventListener(DROPDOWN_EVENT, onOther);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !listRef.current) return;
    const active = listRef.current.querySelector<HTMLElement>(
      '[data-selected="true"]',
    );
    active?.scrollIntoView({ block: "center" });
  }, [open]);

  const openMenu = () => {
    window.dispatchEvent(
      new CustomEvent(DROPDOWN_EVENT, { detail: idRef.current }),
    );
    setOpen(true);
  };

  const pick = (next: number) => {
    if (!onChange) return;
    const event = {
      target: { value: String(next) },
    } as ChangeEvent<HTMLSelectElement>;
    onChange(event);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          if (open) setOpen(false);
          else openMenu();
        }}
        className={cn(
          "inline-flex h-7 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 text-[12px] font-semibold text-slate-800",
          "hover:border-sky-300 hover:bg-sky-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
          open && "border-sky-400 bg-sky-50 ring-2 ring-sky-200",
          disabled && "opacity-50",
        )}
      >
        <span className="max-w-[5.25rem] truncate">{selected?.label ?? "—"}</span>
        <ChevronDown
          size={12}
          className={cn(
            "shrink-0 text-slate-500 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 top-[calc(100%+4px)] z-20 max-h-36 min-w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.35)] sf-hide-scrollbar"
        >
          {(options ?? []).map((opt) => (
            <li key={opt.value} role="presentation">
              <button
                type="button"
                role="option"
                disabled={opt.disabled}
                aria-selected={opt.value === Number(value)}
                data-selected={opt.value === Number(value) ? "true" : "false"}
                onClick={() => pick(opt.value)}
                className={cn(
                  "flex w-full items-center px-2.5 py-1 text-left text-[11px] font-medium text-slate-700",
                  "hover:bg-sky-50 hover:text-sky-800 disabled:opacity-40",
                  opt.value === Number(value) &&
                    "bg-sky-500 font-semibold text-white hover:bg-sky-500 hover:text-white",
                )}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`dp-${++pickerSeq}`);
  const selected = parseValue(value);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onOtherOpen = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id !== idRef.current) setOpen(false);
    };
    window.addEventListener(OPEN_EVENT, onOtherOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOtherOpen);
  }, []);

  const openPicker = () => {
    window.dispatchEvent(
      new CustomEvent(OPEN_EVENT, { detail: idRef.current }),
    );
    setOpen(true);
  };

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
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
    };
    const timer = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointer);
    }, 0);
    document.addEventListener("keydown", onKey, true);
    return () => {
      window.clearTimeout(timer);
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
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (open) setOpen(false);
          else openPicker();
        }}
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
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
              <button
                type="button"
                aria-label="Dismiss calendar"
                className="absolute inset-0 bg-slate-900/25"
                onClick={() => setOpen(false)}
              />
              <div
                ref={popoverRef}
                role="dialog"
                aria-label="Choose date"
                data-date-picker-open="true"
                className="sf-date-picker relative z-10 w-[300px] rounded-2xl border border-slate-200/90 bg-white p-3 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)]"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <DayPicker
                  mode="single"
                  selected={selected}
                  defaultMonth={selected ?? new Date()}
                  captionLayout="dropdown"
                  navLayout="after"
                  startMonth={new Date(1990, 0)}
                  endMonth={new Date(2045, 11)}
                  onSelect={(day) => {
                    onChange(day ? format(day, "yyyy-MM-dd") : "");
                    setOpen(false);
                  }}
                  components={{ Dropdown: PolishedDropdown }}
                  className="rdp-root mx-auto"
                />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
