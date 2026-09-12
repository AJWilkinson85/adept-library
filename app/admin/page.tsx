import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { currentEmail } from "@/auth";
import { getDb, schema } from "@/db";
import { isAdmin } from "@/lib/access";
import { grantAccess } from "@/lib/actions";

export const metadata: Metadata = { title: "Admin" };

const fmt = (d: Date | null) =>
  d ? d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ granted?: string; days?: string; error?: string }>;
}) {
  const email = await currentEmail();
  if (!email) redirect("/login?next=/admin");
  if (!isAdmin(email)) redirect("/library");

  const { granted, days, error } = await searchParams;
  const recent = await getDb()
    .select()
    .from(schema.memberships)
    .orderBy(desc(schema.memberships.updatedAt))
    .limit(25);

  return (
    <div className="wrap">
      <span className="label label--accent">Admin</span>
      <h1>Grant access.</h1>
      <p className="lede">
        Give someone Library access for a set number of days — for example, 90 days for a Working
        Session client. They sign in with this exact email.
      </p>

      {granted && (
        <p className="notice notice--ok">
          Granted {days} days of access to <strong>{granted}</strong>.
        </p>
      )}
      {error && <p className="notice notice--warn">Enter a valid email and a positive number of days.</p>}

      <form action={grantAccess} className="card" style={{ maxWidth: 560 }}>
        <div className="field">
          <label className="label label--ink" htmlFor="email">
            Email
          </label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <div className="field">
          <label className="label label--ink" htmlFor="days">
            Days
          </label>
          <input className="input" id="days" name="days" type="number" min={1} defaultValue={90} required />
        </div>
        <button type="submit" className="btn">
          Grant access
        </button>
      </form>

      <h2>Recent memberships</h2>
      <div className="prose" style={{ maxWidth: "none", overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Source</th>
              <th>Period end</th>
              <th>Granted until</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  No memberships yet.
                </td>
              </tr>
            )}
            {recent.map((r) => (
              <tr key={r.id}>
                <td>{r.userEmail}</td>
                <td>{r.status}</td>
                <td>{r.source}</td>
                <td>{fmt(r.currentPeriodEnd)}</td>
                <td>{fmt(r.grantedUntil)}</td>
                <td>{fmt(r.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
