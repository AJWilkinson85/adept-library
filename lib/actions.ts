"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentEmail, signIn, signOut } from "@/auth";
import { getDb, schema } from "@/db";
import { getAccess, isAdmin } from "@/lib/access";

// ---- Auth ----

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const next = String(formData.get("next") ?? "/library");
  if (!email || !email.includes("@")) redirect("/login?error=email");

  // Only allow same-site relative redirects.
  const redirectTo = next.startsWith("/") && !next.startsWith("//") ? next : "/library";
  try {
    await signIn("resend", { email, redirectTo, redirect: false });
  } catch (err) {
    console.error("[auth] could not send magic link", err);
    redirect("/login?error=send");
  }
  redirect(`/login?sent=1&email=${encodeURIComponent(email)}`);
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

// ---- Progress ----

export async function markComplete(lessonSlug: string) {
  const email = await currentEmail();
  if (!email) redirect("/login");
  const access = await getAccess(email);
  if (!access.allowed) redirect("/join");

  await getDb()
    .insert(schema.progress)
    .values({ userEmail: email, lessonSlug })
    .onConflictDoNothing();

  revalidatePath("/library", "layout");
}

export async function unmarkComplete(lessonSlug: string) {
  const email = await currentEmail();
  if (!email) redirect("/login");

  await getDb()
    .delete(schema.progress)
    .where(and(eq(schema.progress.userEmail, email), eq(schema.progress.lessonSlug, lessonSlug)));

  revalidatePath("/library", "layout");
}

// ---- Admin ----

export async function grantAccess(formData: FormData) {
  const admin = await currentEmail();
  if (!isAdmin(admin)) redirect("/library");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const days = Number(formData.get("days") ?? 90);
  if (!email.includes("@") || !Number.isFinite(days) || days <= 0) {
    redirect("/admin?error=invalid");
  }

  const grantedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await getDb()
    .insert(schema.memberships)
    .values({
      userEmail: email,
      status: "granted",
      source: "manual",
      grantedUntil,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.memberships.userEmail,
      set: { status: "granted", source: "manual", grantedUntil, updatedAt: new Date() },
    });

  revalidatePath("/admin");
  redirect(`/admin?granted=${encodeURIComponent(email)}&days=${days}`);
}
