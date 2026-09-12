import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentEmail } from "@/auth";
import { getAccess, isAdmin } from "@/lib/access";
import { signOutAction } from "@/lib/actions";

export const metadata: Metadata = { title: "Account" };

const fmt = (d: Date | null | undefined) =>
  d ? d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "n/a";

export default async function AccountPage() {
  const email = await currentEmail();
  if (!email) redirect("/login?next=/account");
  const access = await getAccess(email);
  const m = access.membership;

  const statusLabel = isAdmin(email)
    ? "Admin"
    : !m || m.status === "none"
      ? "No membership"
      : m.status === "granted"
        ? access.allowed
          ? "Granted"
          : "Granted (expired)"
        : m.status === "past_due"
          ? "Past due"
          : m.status === "canceled"
            ? "Canceled"
            : access.allowed
              ? "Active"
              : "Expired";

  return (
    <div className="wrap narrow">
      <span className="label label--accent">Account</span>
      <h1>Your membership.</h1>

      <div className="rows">
        <div className="row">
          <span className="label">Email</span>
          <span>{email}</span>
        </div>
        <div className="row">
          <span className="label">Status</span>
          <span>
            <span className={`status ${access.allowed ? "status--on" : "status--warn"}`}>{statusLabel}</span>
          </span>
        </div>
        {m?.source === "stripe" && (
          <div className="row">
            <span className="label">Renews / ends</span>
            <span>{fmt(m.currentPeriodEnd)}</span>
          </div>
        )}
        {m?.status === "granted" && (
          <div className="row">
            <span className="label">Access until</span>
            <span>{fmt(m.grantedUntil)}</span>
          </div>
        )}
      </div>

      {m?.status === "past_due" && (
        <p className="notice notice--warn">
          Your last payment did not go through. Update your card in the billing portal to keep access.
        </p>
      )}

      <div className="actions" style={{ marginTop: 0 }}>
        {m?.stripeCustomerId ? (
          <form action="/api/portal" method="post">
            <button type="submit" className="btn">
              Manage billing
            </button>
          </form>
        ) : !access.allowed || access.reason === "granted" ? (
          <Link href="/join" className="btn">
            Join Advisor on Call
          </Link>
        ) : null}
        <form action={signOutAction}>
          <button type="submit" className="btn btn--ghost">
            Sign out
          </button>
        </form>
      </div>

      {m?.stripeCustomerId && (
        <p className="muted" style={{ marginTop: 16, fontSize: 15 }}>
          Billing is handled by Stripe. Cancel any month; access continues to the end of the paid
          period.
        </p>
      )}
    </div>
  );
}
