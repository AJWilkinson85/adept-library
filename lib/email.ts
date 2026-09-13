/** Minimal Resend sender used outside Auth.js (lead magnet, notifications). */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<boolean> {
  const key = process.env.AUTH_RESEND_KEY;
  const from = process.env.AUTH_EMAIL_FROM || "Adept Advisors <hello@adeptadvisors.com>";
  if (!key) {
    console.warn("[email] AUTH_RESEND_KEY not set; skipping send to", opts.to);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      reply_to: opts.replyTo,
    }),
  });
  if (!res.ok) {
    console.error("[email] send failed", res.status, await res.text());
    return false;
  }
  return true;
}
