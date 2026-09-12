import { redirect } from "next/navigation";
import { currentEmail } from "@/auth";
import { getAccess } from "@/lib/access";

/** For /library routes: returns the member's email, or redirects to /login or /join. */
export async function requireAccess(nextPath = "/library"): Promise<string> {
  const email = await currentEmail();
  if (!email) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  const access = await getAccess(email);
  if (!access.allowed) redirect("/join");
  return email;
}
