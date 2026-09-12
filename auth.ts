import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, schema } from "@/db";

// `db` is a lazy proxy, so DATABASE_URL is only required once a query actually runs.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  session: { strategy: "database" },
  providers: [
    Resend({
      from: process.env.AUTH_EMAIL_FROM ?? "Adept Advisors <hello@adeptadvisors.com>",
    }),
  ],
  pages: { signIn: "/login", verifyRequest: "/login?sent=1" },
  trustHost: true,
});

/** Returns the signed-in user's email (lowercased) or null. */
export async function currentEmail(): Promise<string | null> {
  const session = await auth();
  const email = session?.user?.email;
  return email ? email.toLowerCase() : null;
}
