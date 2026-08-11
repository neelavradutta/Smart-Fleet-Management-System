"use client";

import { useEffect, useRef } from "react";

/** Kill horizontal wheel/trackpad so Chrome/Edge not treat it as back/forward. */
export function useBlockHistorySwipe<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return ref;
}
