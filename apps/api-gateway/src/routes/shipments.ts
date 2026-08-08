import { Router } from "express";
import { randomBytes } from "node:crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { auditLogs, shipments } from "@sfms/db";
import {
  createShipmentSchema,
  proofOfDeliverySchema,
  updateShipmentStatusSchema,
} from "@sfms/shared";
import { db } from "../lib/db.js";
import { enqueueWebhook } from "../lib/webhooks.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const shipmentsRouter = Router();

shipmentsRouter.get("/", async (req: AuthedRequest, res) => {
  const rows = await db
    .select()
    .from(shipments)
    .where(eq(shipments.fleetId, req.fleetId!))
    .orderBy(desc(shipments.createdAt));
  res.json({ data: rows });
});

shipmentsRouter.get("/exceptions", async (req: AuthedRequest, res) => {
  const rows = await db
    .select()
    .from(shipments)
    .where(
      and(
        eq(shipments.fleetId, req.fleetId!),
        inArray(shipments.shipmentStatus, ["FAILED", "IN_TRANSIT"]),
      ),
    )
    .orderBy(desc(shipments.createdAt));
  res.json({
    data: rows.filter(
      (s) =>
        s.shipmentStatus === "FAILED" ||
        (s.expectedDeliveryTime &&
          s.expectedDeliveryTime < new Date() &&
          s.shipmentStatus !== "DELIVERED"),
    ),
  });
});

shipmentsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createShipmentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const trackingToken = randomBytes(24).toString("hex");
  const [row] = await db
    .insert(shipments)
    .values({
      fleetId: req.fleetId!,
      routeId: parsed.data.routeId ?? null,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      customerEmail: parsed.data.customerEmail,
      pickupAddress: parsed.data.pickupAddress,
      deliveryAddress: parsed.data.deliveryAddress,
      pickupLat: parsed.data.pickupLat?.toFixed(6),
      pickupLng: parsed.data.pickupLng?.toFixed(6),
      deliveryLat: parsed.data.deliveryLat?.toFixed(6),
      deliveryLng: parsed.data.deliveryLng?.toFixed(6),
      weightKg: parsed.data.weightKg?.toString(),
      volumeM3: parsed.data.volumeM3?.toString(),
      expectedDeliveryTime: parsed.data.expectedDeliveryTime
        ? new Date(parsed.data.expectedDeliveryTime)
        : null,
      trackingToken,
      shipmentStatus: parsed.data.routeId ? "ASSIGNED" : "CREATED",
    })
    .returning();

  await enqueueWebhook(req.fleetId!, "shipment.created", row as unknown as Record<string, unknown>);
  await db.insert(auditLogs).values({
    fleetId: req.fleetId!,
    actorUserId: req.userId,
    action: "shipment.create",
    entityType: "shipment",
    entityId: row.id,
  });

  res.status(201).json({ data: row });
});

shipmentsRouter.patch("/:id/status", async (req: AuthedRequest, res) => {
  const parsed = updateShipmentStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const [row] = await db
    .update(shipments)
    .set({
      shipmentStatus: parsed.data.status,
      actualDeliveryTime:
        parsed.data.status === "DELIVERED" ? new Date() : undefined,
    })
    .where(and(eq(shipments.id, req.params.id), eq(shipments.fleetId, req.fleetId!)))
    .returning();

  if (!row) return res.status(404).json({ error: "Not found" });
  await enqueueWebhook(req.fleetId!, "shipment.status", row as unknown as Record<string, unknown>);
  res.json({ data: row });
});

shipmentsRouter.post("/:id/proof-of-delivery", async (req: AuthedRequest, res) => {
  const parsed = proofOfDeliverySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const [row] = await db
    .update(shipments)
    .set({
      shipmentStatus: "DELIVERED",
      actualDeliveryTime: new Date(),
      podSignatureUrl: parsed.data.signatureUrl,
      podPhotoUrls: parsed.data.photoUrls,
    })
    .where(and(eq(shipments.id, req.params.id), eq(shipments.fleetId, req.fleetId!)))
    .returning();

  if (!row) return res.status(404).json({ error: "Not found" });
  await enqueueWebhook(req.fleetId!, "delivery.completed", row as unknown as Record<string, unknown>);
  res.json({ data: row });
});

/** Public tracking — no auth; uses tracking token GUC for RLS */
export const publicTrackingRouter = Router();

publicTrackingRouter.get("/:token", async (req, res) => {
  await db.execute(
    sql`select set_config('app.tracking_token', ${req.params.token}, true)`,
  );

  const [row] = await db
    .select({
      id: shipments.id,
      shipmentStatus: shipments.shipmentStatus,
      customerName: shipments.customerName,
      deliveryAddress: shipments.deliveryAddress,
      expectedDeliveryTime: shipments.expectedDeliveryTime,
      actualDeliveryTime: shipments.actualDeliveryTime,
    })
    .from(shipments)
    .where(eq(shipments.trackingToken, req.params.token))
    .limit(1);

  if (!row) return res.status(404).json({ error: "Tracking not found" });
  res.json({ data: row });
});
