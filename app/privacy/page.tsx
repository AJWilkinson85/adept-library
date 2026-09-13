import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="wrap">
      <article className="lesson" style={{ maxWidth: 720 }}>
        <span className="label label--accent">Privacy</span>
        <h1>What we keep, and why.</h1>
        <div className="prose">
          <p>
            Adept Advisors (Phoenix, Arizona) runs adeptadvisors.com and members.adeptadvisors.com.
            This page says plainly what information we hold and what we do with it.
          </p>
          <h2>If you request the free guide</h2>
          <p>
            We store your email address, and your name and business name if you gave them, so we
            can send the guide and, about once a month, a short update from Aaron. Every update has
            an unsubscribe link, and replying &ldquo;stop&rdquo; works too. We do not sell or share
            the list.
          </p>
          <h2>If you are a member</h2>
          <p>
            We store your email address (used to sign you in with a one-time link), which lessons
            you have marked complete, and your membership status. If you subscribe through Stripe,
            Stripe holds your payment details; we never see your card number. We keep Stripe&rsquo;s
            customer and subscription identifiers so we can tell the site you are a member.
          </p>
          <h2>Services we use</h2>
          <p>
            Vercel (hosting), Neon (database), Resend (email delivery), Stripe (payments), and Google
            Calendar (booking calls). Each is bound by its own privacy terms and receives only what
            it needs to do its job.
          </p>
          <h2>Your choices</h2>
          <p>
            Email hello@adeptadvisors.com to see, correct, or delete anything we hold about you. We
            will do it within a week and confirm by reply.
          </p>
          <p className="muted">Last updated September 2026.</p>
        </div>
      </article>
    </div>
  );
}
