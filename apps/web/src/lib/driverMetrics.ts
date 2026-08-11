import { api } from "@/lib/api";
import type { DriverDetails } from "@/components/drivers/DriverDetailsOverlay";

export type DriverUpdateSource = "software" | "manual";

export type DriverPatch = Partial<DriverDetails> & {
  source?: DriverUpdateSource;
};

/** Overlay + roster + API all use this. Undefined keys skipped. Null clears. */
export function mergeDriver(
  current: DriverDetails,
  patch: DriverPatch,
): DriverDetails {
  const next: DriverDetails = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (key === "source" || value === undefined) continue;
    (next as Record<string, unknown>)[key] = value;
  }
  return next;
}

export function missingMetric(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

export async function patchDriver(id: string, patch: DriverPatch) {
  return api<{ data: DriverDetails }>(`/api/v1/drivers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
