import type { Metadata } from "next";
import Link from "next/link";
import { getModules, progressKey } from "@/lib/content";
import { getCompletedSlugs } from "@/lib/progress";
import { requireAccess } from "@/lib/require-access";

export const metadata: Metadata = { title: "Library" };

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const email = await requireAccess("/library");
  const { welcome } = await searchParams;
  const modules = getModules();
  const done = await getCompletedSlugs(email);
  const total = modules.reduce((n, m) => n + m.lessons.length, 0);
  const completed = modules.reduce(
    (n, m) => n + m.lessons.filter((l) => done.has(progressKey(l))).length,
    0,
  );

  return (
    <div className="wrap">
      {welcome && (
        <p className="notice notice--ok">
          Welcome aboard. Your subscription is active — start with the first lesson below.
        </p>
      )}
      <span className="label label--accent">The Adept Library</span>
      <h1>Lessons.</h1>
      <p className="lede">
        {total > 0 ? (
          <>
            {completed} of {total} lessons complete. Work through them in order, or jump to what you
            need.
          </>
        ) : (
          <>Lessons are being added. Check back soon.</>
        )}
      </p>

      {modules.map((m) => {
        const doneCount = m.lessons.filter((l) => done.has(progressKey(l))).length;
        return (
          <section className="module" key={m.slug} aria-labelledby={`m-${m.slug}`}>
            <div className="module__head">
              <div>
                <span className="label">Module {String(m.order).padStart(2, "0")}</span>
                <h2 id={`m-${m.slug}`}>{m.title}</h2>
                {m.summary && <p>{m.summary}</p>}
              </div>
              <span className="label module__count">
                {doneCount}/{m.lessons.length} complete
              </span>
            </div>
            <ol className="lessons">
              {m.lessons.map((l) => {
                const isDone = done.has(progressKey(l));
                return (
                  <li key={l.slug}>
                    <Link href={l.href}>
                      <span className={`tick${isDone ? " tick--done" : ""}`} aria-hidden="true">
                        {isDone ? "✓" : ""}
                      </span>
                      <span>
                        {l.title}
                        {isDone && <span className="sr-only"> (complete)</span>}
                      </span>
                      <span className="mins">{l.minutes ? `${l.minutes} min` : ""}</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
