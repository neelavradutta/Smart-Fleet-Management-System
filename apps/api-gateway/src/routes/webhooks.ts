import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { webhookOutbox, webhooks } from "@sfms/db";
import { createWebhookSchema } from "@sfms/shared";
import { db } from "../lib/db.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const webhooksRouter = Router();

webhooksRouter.get("/", async (req: AuthedRequest, res) => {
  const rows = await db
    .select()
    .from(webhooks)
    .where(eq(webhooks.fleetId, req.fleetId!))
    .orderBy(desc(webhooks.createdAt));
  res.json({ data: rows });
});

webhooksRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createWebhookSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const [row] = await db
    .insert(webhooks)
    .values({
      fleetId: req.fleetId!,
      event: parsed.data.event,
      url: parsed.data.url,
      isActive: parsed.data.isActive,
    })
    .returning();

  res.status(201).json({ data: row });
});

webhooksRouter.post("/flush", async (req: AuthedRequest, res) => {
  const pending = await db
    .select()
    .from(webhookOutbox)
    .where(
      and(
        eq(webhookOutbox.fleetId, req.fleetId!),
        eq(webhookOutbox.delivered, false),
      ),
    )
    .limit(50);

  const hooks = await db
    .select()
    .from(webhooks)
    .where(
      and(eq(webhooks.fleetId, req.fleetId!), eq(webhooks.isActive, true)),
    );

  let delivered = 0;
  for (const item of pending) {
    const targets = hooks.filter(
      (h) => h.event === item.event || h.event === "*",
    );
    for (const t of targets) {
      try {
        await fetch(t.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: item.event, payload: item.payload }),
        });
      } catch {
        // keep undelivered
      }
    }
    await db
      .update(webhookOutbox)
      .set({ delivered: true, attempts: item.attempts + 1 })
      .where(eq(webhookOutbox.id, item.id));
    delivered += 1;
  }

  res.json({ data: { flushed: delivered } });
});
