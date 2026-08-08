import type { Db } from "./client.js";
import { sql } from "drizzle-orm";

/** Set Postgres session GUC used by RLS policies. */
export async function setTenant(db: Db, fleetId: string) {
  await db.execute(sql`select set_config('app.current_tenant', ${fleetId}, true)`);
}
