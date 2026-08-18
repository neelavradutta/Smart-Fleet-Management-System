import { api } from "@/lib/api";
import type { VehicleCardModel } from "@/components/vehicles/VehicleCard";

export type VehicleUpdateSource = "software" | "manual";

export type VehiclePatch = Partial<VehicleCardModel> & {
  source?: VehicleUpdateSource;
};

/** Overlay + roster + API all use this. Undefined keys skipped. Null clears. */
export function mergeVehicle(
  current: VehicleCardModel,
  patch: VehiclePatch,
): VehicleCardModel {
  const next: VehicleCardModel = { ...current };
  for (const [key, value] of Object.entries(patch)) {
    if (key === "source" || value === undefined) continue;
    (next as Record<string, unknown>)[key] = value;
  }
  return next;
}

export function missingMetric(value: unknown): boolean {
  return value === undefined || value === null || value === "";
}

export async function patchVehicle(id: string, patch: VehiclePatch) {
  return api<{ data: VehicleCardModel }>(`/api/v1/vehicles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
