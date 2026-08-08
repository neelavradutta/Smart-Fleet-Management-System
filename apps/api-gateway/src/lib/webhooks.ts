import { webhookOutbox } from "@sfms/db";
import { db } from "./db.js";

export async function enqueueWebhook(
  fleetId: string,
  event: string,
  payload: Record<string, unknown>,
) {
  await db.insert(webhookOutbox).values({
    fleetId,
    event,
    payload,
  });
}
