import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { fleets, users } from "@sfms/db";
import { loginSchema } from "@sfms/shared";
import { db } from "../lib/db.js";
import { env } from "../env.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const rows = await db
    .select({
      userId: users.id,
      fleetId: users.fleetId,
      passwordHash: users.passwordHash,
      role: users.role,
      fullName: users.fullName,
      email: users.email,
      fleetName: fleets.name,
      tier: fleets.subscriptionTier,
    })
    .from(users)
    .innerJoin(fleets, eq(fleets.id, users.fleetId))
    .where(eq(users.email, email))
    .limit(1);

  const row = rows[0];
  if (!row || !(await bcrypt.compare(password, row.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign(
    {
      fleetId: row.fleetId,
      userId: row.userId,
      email: row.email,
      role: row.role,
      permissions: [],
    },
    env.jwtSecret,
    { expiresIn: "24h" },
  );

  return res.json({
    token,
    user: {
      id: row.userId,
      email: row.email,
      fullName: row.fullName,
      role: row.role,
      fleetId: row.fleetId,
      fleetName: row.fleetName,
      tier: row.tier,
    },
  });
});
