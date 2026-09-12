import Stripe from "stripe";
import { getDb, schema } from "@/db";
import type { MembershipStatus } from "@/db/schema";

let _stripe: Stripe | undefined;

/** Lazily-initialized Stripe client. Throws a clear error at request time if STRIPE_SECRET_KEY is unset. */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set. Add it to your environment (see .env.example).");
  _stripe = new Stripe(key);
  return _stripe;
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/** Map a Stripe subscription status onto our membership statuses. */
export function mapStripeStatus(status: Stripe.Subscription.Status): MembershipStatus {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return "canceled";
    default:
      return "none";
  }
}

/** Period end lives on subscription items since Stripe API 2025-03-31. Take the latest one. */
export function subscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
  const ends = sub.items.data.map((i) => i.current_period_end).filter(Boolean);
  if (!ends.length) return null;
  return new Date(Math.max(...ends) * 1000);
}

/** Upsert the memberships row for a Stripe subscription. */
export async function syncSubscription(sub: Stripe.Subscription, emailHint?: string | null) {
  const stripe = getStripe();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  let email = emailHint?.toLowerCase() ?? null;
  if (!email) {
    const customer = await stripe.customers.retrieve(customerId);
    if (!customer.deleted) email = customer.email?.toLowerCase() ?? null;
  }
  if (!email) {
    console.warn(`[stripe] subscription ${sub.id} has no customer email; skipping`);
    return;
  }

  const values = {
    userEmail: email,
    status: mapStripeStatus(sub.status),
    source: "stripe" as const,
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    currentPeriodEnd: subscriptionPeriodEnd(sub),
    updatedAt: new Date(),
  };

  await getDb()
    .insert(schema.memberships)
    .values(values)
    .onConflictDoUpdate({ target: schema.memberships.userEmail, set: values });
}
