import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

/** Set of completed progress keys ("module/lesson") for a user. */
export async function getCompletedSlugs(email: string): Promise<Set<string>> {
  const rows = await getDb()
    .select({ slug: schema.progress.lessonSlug })
    .from(schema.progress)
    .where(eq(schema.progress.userEmail, email));
  return new Set(rows.map((r) => r.slug));
}
