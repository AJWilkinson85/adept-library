import { NextResponse } from "next/server";
import { getDb, schema } from "@/db";
import { sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/stripe";

const ALLOWED_ORIGINS = new Set([
  "https://adeptadvisors.com",
  "https://www.adeptadvisors.com",
  "http://localhost:3000",
]);

function cors(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://adeptadvisors.com";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: cors(req.headers.get("origin")) });
}

/**
 * Lead capture for the free "Write your business brief" guide.
 * Accepts JSON or form-encoded {email, name?, business?, source?}.
 * Stores the lead (idempotent on email) and emails the guide link.
 */
export async function POST(req: Request) {
  const headers = cors(req.headers.get("origin"));
  let email = "", name = "", business = "", source = "brief", redirect = "";

  const ct = req.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/json")) {
      const j = (await req.json()) as Record<string, string>;
      ({ email = "", name = "", business = "", source = "brief", redirect = "" } = j);
    } else {
      const f = await req.formData();
      email = String(f.get("email") ?? "");
      name = String(f.get("name") ?? "");
      business = String(f.get("business") ?? "");
      source = String(f.get("source") ?? "brief");
      redirect = String(f.get("redirect") ?? "");
      // Honeypot: bots fill every field.
      if (String(f.get("website") ?? "")) return NextResponse.json({ ok: true }, { headers });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400, headers });
  }

  email = email.trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "email" }, { status: 400, headers });
  }

  await getDb()
    .insert(schema.leads)
    .values({ email, name: name.trim() || null, business: business.trim() || null, source })
    .onConflictDoUpdate({
      target: schema.leads.email,
      set: { name: name.trim() || undefined, business: business.trim() || undefined },
    });

  const base = siteUrl();
  const first = name.trim().split(/\s+/)[0] || "";
  const greeting = first ? `Hi ${first},` : "Hi,";
  const text = `${greeting}

Here is the guide: ${base}/brief

It walks you through writing a one-page "business brief" in about five minutes, using one prompt you paste into Claude or ChatGPT. Once you have it, every AI tool you use stops starting from zero.

The PDF version is at ${base}/adept-business-brief.pdf if you want to print it.

If you get stuck, reply to this email. I read every one.

Aaron
Adept Advisors, Phoenix
https://adeptadvisors.com`;

  const html = `<p>${greeting}</p>
<p>Here is the guide: <a href="${base}/brief">${base}/brief</a></p>
<p>It walks you through writing a one-page "business brief" in about five minutes, using one prompt you paste into Claude or ChatGPT. Once you have it, every AI tool you use stops starting from zero.</p>
<p>The PDF version is <a href="${base}/adept-business-brief.pdf">here</a> if you want to print it.</p>
<p>If you get stuck, reply to this email. I read every one.</p>
<p>Aaron<br>Adept Advisors, Phoenix<br><a href="https://adeptadvisors.com">adeptadvisors.com</a></p>`;

  await sendEmail({
    to: email,
    subject: "Your business brief guide",
    text,
    html,
    replyTo: "hello@adeptadvisors.com",
  });

  // Notify Aaron. Best effort.
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (admins[0]) {
    await sendEmail({
      to: admins[0],
      subject: `New lead: ${email}`,
      text: `${name || "(no name)"} <${email}>\nBusiness: ${business || "(not given)"}\nSource: ${source}\n\nAdmin: ${base}/admin`,
    });
  }

  if (redirect && /^https:\/\/(www\.)?adeptadvisors\.com(\/|$)/.test(redirect)) {
    return NextResponse.redirect(redirect, { status: 303, headers });
  }
  return NextResponse.json({ ok: true }, { headers });
}
