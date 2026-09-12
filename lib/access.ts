import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

export type Access = {
  allowed: boolean;
  reason: "admin" | "subscription" | "granted" | "expired" | "none";
  membership: typeof schema.memberships.$inferSelect | null;
};

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export async function getMembership(email: string) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.memberships)
    .where(eq(schema.memberships.userEmail, email.toLowerCase()))
    .limit(1);
  return row ?? null;
}

/**
 * Access rule:
 *  - ADMIN_EMAILS always allowed
 *  - status active|past_due with current_period_end in the future
 *  - status granted with granted_until in the future
 */
export async function getAccess(email: string | null | undefined): Promise<Access> {
  if (!email) return { allowed: false, reason: "none", membership: null };
  if (isAdmin(email)) return { allowed: true, reason: "admin", membership: null };

  const m = await getMembership(email);
  if (!m) return { allowed: false, reason: "none", membership: null };

  const now = Date.now();
  if (
    (m.status === "active" || m.status === "past_due") &&
    m.currentPeriodEnd &&
    m.currentPeriodEnd.getTime() > now
  ) {
    return { allowed: true, reason: "subscription", membership: m };
  }
  if (m.status === "granted" && m.grantedUntil && m.grantedUntil.getTime() > now) {
    return { allowed: true, reason: "granted", membership: m };
  }
  return { allowed: false, reason: m.status === "none" ? "none" : "expired", membership: m };
}
