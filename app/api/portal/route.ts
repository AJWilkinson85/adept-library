import { NextResponse } from "next/server";
import { currentEmail } from "@/auth";
import { getMembership } from "@/lib/access";
import { getStripe, siteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const email = await currentEmail();
  if (!email) {
    return NextResponse.redirect(new URL("/login?next=/account", siteUrl()), 303);
  }

  try {
    const membership = await getMembership(email);
    if (!membership?.stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer on file for this account." }, { status: 404 });
    }
    const portal = await getStripe().billingPortal.sessions.create({
      customer: membership.stripeCustomerId,
      return_url: `${siteUrl()}/account`,
    });
    return NextResponse.redirect(portal.url, 303);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not open billing portal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
