import { Router } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { documents } from "@sfms/db";
import { createDocumentSchema } from "@sfms/shared";
import { db } from "../lib/db.js";
import type { AuthedRequest } from "../middleware/auth.js";

export const documentsRouter = Router();

documentsRouter.get("/", async (req: AuthedRequest, res) => {
  const rows = await db
    .select()
    .from(documents)
    .where(eq(documents.fleetId, req.fleetId!))
    .orderBy(desc(documents.createdAt));
  res.json({ data: rows });
});

documentsRouter.get("/expiring", async (req: AuthedRequest, res) => {
  const rows = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.fleetId, req.fleetId!),
        sql`${documents.expiresAt} IS NOT NULL AND ${documents.expiresAt} <= CURRENT_DATE + INTERVAL '30 days'`,
      ),
    );
  res.json({ data: rows });
});

documentsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = createDocumentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const [row] = await db
    .insert(documents)
    .values({
      fleetId: req.fleetId!,
      entityType: parsed.data.entityType,
      entityId: parsed.data.entityId,
      docType: parsed.data.docType,
      title: parsed.data.title,
      fileUrl: parsed.data.fileUrl,
      expiresAt: parsed.data.expiresAt,
    })
    .returning();

  res.status(201).json({ data: row });
});
