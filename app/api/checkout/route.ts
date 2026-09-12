import { NextResponse } from "next/server";
import { currentEmail } from "@/auth";
import { getStripe, siteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const email = await currentEmail();
  if (!email) {
    return NextResponse.redirect(new URL("/login?next=/join", siteUrl()), 303);
  }

  const price = process.env.STRIPE_PRICE_ADVISOR;
  if (!price) {
    return NextResponse.json({ error: "STRIPE_PRICE_ADVISOR is not set." }, { status: 500 });
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      customer_email: email,
      client_reference_id: email,
      allow_promotion_codes: true,
      success_url: `${siteUrl()}/library?welcome=1`,
      cancel_url: `${siteUrl()}/join`,
    });
    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    return NextResponse.redirect(session.url, 303);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
