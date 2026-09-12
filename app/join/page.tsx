import type { Metadata } from "next";
import Link from "next/link";
import { currentEmail } from "@/auth";
import { getAccess } from "@/lib/access";

export const metadata: Metadata = { title: "Join" };

export default async function JoinPage() {
  const email = await currentEmail();
  const access = email ? await getAccess(email) : null;

  return (
    <div className="wrap">
      <span className="label label--accent">Advisor on Call</span>
      <h1>An AI advisor on retainer.</h1>
      <p className="lede">
        For owner-operators who want a steady hand while they put AI to work. Monthly, no contract,
        cancel any month.
      </p>

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="price">
          $600 <small>/ month</small>
        </div>
        <ul className="checklist">
          <li>Two office-hours calls a month with Aaron</li>
          <li>Full access to the Adept Library — every module, every worksheet</li>
          <li>Email questions between calls</li>
          <li>Cancel any month from your account page</li>
        </ul>

        {access?.allowed ? (
          <>
            <p className="notice notice--ok">You already have access.</p>
            <Link href="/library" className="btn">
              Go to the Library
            </Link>
          </>
        ) : email ? (
          <form action="/api/checkout" method="post">
            <button type="submit" className="btn">
              Subscribe
            </button>
            <p className="muted" style={{ marginTop: 12, fontSize: 15 }}>
              Signed in as {email}. Checkout is handled by Stripe.
            </p>
          </form>
        ) : (
          <>
            <Link href="/login?next=/join" className="btn">
              Subscribe
            </Link>
            <p className="muted" style={{ marginTop: 12, fontSize: 15 }}>
              You will sign in first so we can attach the subscription to your email.
            </p>
          </>
        )}
      </div>

      <hr />
      <p className="muted" style={{ maxWidth: 640 }}>
        Working Session client? Your 90 days of access is granted by Aaron; sign in with the email you
        booked with.
      </p>
    </div>
  );
}
