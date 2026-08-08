import { alerts } from "@sfms/db";
import type { Server as SocketIOServer } from "socket.io";
import { db } from "./db.js";
import { enqueueWebhook } from "./webhooks.js";

export async function createAlert(
  io: SocketIOServer | null,
  input: {
    fleetId: string;
    alertType:
      | "GEOFENCE_VIOLATION"
      | "MAINTENANCE_DUE"
      | "HARSH_DRIVING"
      | "FUEL_ANOMALY"
      | "DELAY"
      | "BREAKDOWN";
    alertSeverity?: "INFO" | "WARNING" | "CRITICAL";
    vehicleId?: string;
    driverId?: string;
    alertMessage: string;
    alertData?: Record<string, unknown>;
  },
) {
  const [row] = await db
    .insert(alerts)
    .values({
      fleetId: input.fleetId,
      alertType: input.alertType,
      alertSeverity: input.alertSeverity ?? "WARNING",
      vehicleId: input.vehicleId,
      driverId: input.driverId,
      alertMessage: input.alertMessage,
      alertData: input.alertData,
    })
    .returning();

  io?.to(`fleet:${input.fleetId}:tracking`).emit("alert", row);
  await enqueueWebhook(input.fleetId, "alert.created", row as unknown as Record<string, unknown>);
  return row;
}
