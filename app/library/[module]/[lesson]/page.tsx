import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx";
import { markComplete, unmarkComplete } from "@/lib/actions";
import { getLesson, progressKey } from "@/lib/content";
import { getCompletedSlugs } from "@/lib/progress";
import { requireAccess } from "@/lib/require-access";

type Params = Promise<{ module: string; lesson: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { module: m, lesson: l } = await params;
  const data = getLesson(m, l);
  return { title: data ? data.lesson.title : "Lesson" };
}

export default async function LessonPage({ params }: { params: Params }) {
  const { module: moduleSlug, lesson: lessonSlug } = await params;
  const email = await requireAccess(`/library/${moduleSlug}/${lessonSlug}`);
  const data = getLesson(moduleSlug, lessonSlug);
  if (!data) notFound();

  const { module: mod, lesson, content, prev, next } = data;
  const done = await getCompletedSlugs(email);
  const key = progressKey(lesson);
  const isDone = done.has(key);

  return (
    <div className="wrap lesson-layout">
      <details className="sidebar" open>
        <summary className="sidebar__head">
          <span className="label">Module {String(mod.order).padStart(2, "0")}</span>
          <h2>{mod.title}</h2>
        </summary>
        <ol className="sidebar__list">
          {mod.lessons.map((l) => {
            const d = done.has(progressKey(l));
            return (
              <li key={l.slug}>
                <Link href={l.href} aria-current={l.slug === lesson.slug ? "page" : undefined}>
                  <span className={`tick${d ? " tick--done" : ""}`} aria-hidden="true">
                    {d ? "✓" : ""}
                  </span>
                  <span>{l.title}</span>
                </Link>
              </li>
            );
          })}
        </ol>
        <div className="sidebar__foot">
          <Link href="/library">← All modules</Link>
        </div>
      </details>

      <article className="lesson">
        <div className="lesson__meta">
          <span className="label label--accent">
            Lesson {String(lesson.order).padStart(2, "0")}
          </span>
          {lesson.minutes > 0 && <span className="label">{lesson.minutes} min read</span>}
          {isDone && <span className="status status--on">Complete</span>}
        </div>
        <h1>{lesson.title}</h1>
        {lesson.summary && <p className="lede">{lesson.summary}</p>}

        <div className="prose">
          <MDXRemote source={content} components={mdxComponents} />
        </div>

        <div className="lesson__complete">
          <span>{isDone ? "You have completed this lesson." : "Finished reading?"}</span>
          {isDone ? (
            <form action={unmarkComplete.bind(null, key)}>
              <button type="submit" className="btn btn--ghost btn--sm">
                Mark incomplete
              </button>
            </form>
          ) : (
            <form action={markComplete.bind(null, key)}>
              <button type="submit" className="btn">
                Mark complete
              </button>
            </form>
          )}
        </div>

        <nav className="pager" aria-label="Lesson navigation">
          {prev ? (
            <Link href={prev.href}>
              <span className="label">← Previous</span>
              <span className="pager__title">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={next.href} className="pager__next">
              <span className="label">Next →</span>
              <span className="pager__title">{next.title}</span>
            </Link>
          ) : (
            <Link href="/library" className="pager__next">
              <span className="label">Done →</span>
              <span className="pager__title">Back to the Library</span>
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
