import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentEmail } from "@/auth";
import { sendMagicLink } from "@/lib/actions";

export const metadata: Metadata = { title: "Sign in" };

type Search = { sent?: string; email?: string; next?: string; error?: string };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Search> }) {
  const { sent, email, next, error } = await searchParams;
  const signedIn = await currentEmail();
  if (signedIn) redirect(next && next.startsWith("/") ? next : "/library");

  if (sent) {
    return (
      <div className="wrap narrow">
        <span className="label label--accent">Check your email</span>
        <h1>Link sent.</h1>
        <p className="lede">
          We emailed a sign-in link{email ? <> to <strong>{email}</strong></> : null}. It expires in 24
          hours. If it does not arrive in a minute or two, check spam — and make sure you used the
          email you subscribed or booked with.
        </p>
        <p>
          <a href="/login">Use a different email</a>
        </p>
      </div>
    );
  }

  return (
    <div className="wrap narrow">
      <span className="label label--accent">Members</span>
      <h1>Sign in.</h1>
      <p className="lede">No passwords. Enter your email and we will send you a one-time link.</p>
      {error === "email" && <p className="notice notice--warn">Please enter a valid email address.</p>}
      {error && error !== "email" && (
        <p className="notice notice--warn">Something went wrong signing you in. Please try again.</p>
      )}
      <form action={sendMagicLink}>
        <input type="hidden" name="next" value={next ?? "/library"} />
        <div className="field">
          <label className="label label--ink" htmlFor="email">
            Email
          </label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <button type="submit" className="btn">
          Send sign-in link
        </button>
      </form>
    </div>
  );
}
