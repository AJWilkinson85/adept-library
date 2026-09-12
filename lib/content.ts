import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.join(process.cwd(), "content", "modules");

export type Lesson = {
  slug: string; // e.g. "what-a-model-is"
  file: string; // e.g. "01-what-a-model-is.mdx"
  moduleSlug: string;
  title: string;
  summary: string;
  minutes: number;
  order: number;
  href: string;
};

export type Module = {
  slug: string; // e.g. "know-the-tool"
  dir: string; // e.g. "01-know-the-tool"
  title: string;
  summary: string;
  order: number;
  lessons: Lesson[];
};

/** Strip a leading "nn-" ordering prefix and a file extension. */
function toSlug(name: string): string {
  return name.replace(/\.mdx$/, "").replace(/^\d+-/, "");
}

function readModule(dir: string): Module | null {
  const full = path.join(ROOT, dir);
  const metaPath = path.join(full, "module.json");
  if (!fs.existsSync(metaPath)) return null;
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as {
    title: string;
    summary?: string;
    order?: number;
  };
  const slug = toSlug(dir);

  const lessons = fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".mdx"))
    .map((file): Lesson => {
      const { data } = matter(fs.readFileSync(path.join(full, file), "utf8"));
      const lessonSlug = toSlug(file);
      return {
        slug: lessonSlug,
        file,
        moduleSlug: slug,
        title: String(data.title ?? lessonSlug),
        summary: String(data.summary ?? ""),
        minutes: Number(data.minutes ?? 0),
        order: Number(data.order ?? 0),
        href: `/library/${slug}/${lessonSlug}`,
      };
    })
    .sort((a, b) => a.order - b.order || a.file.localeCompare(b.file));

  return {
    slug,
    dir,
    title: meta.title,
    summary: meta.summary ?? "",
    order: meta.order ?? 0,
    lessons,
  };
}

export function getModules(): Module[] {
  if (!fs.existsSync(ROOT)) return [];
  return fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => readModule(d.name))
    .filter((m): m is Module => m !== null)
    .sort((a, b) => a.order - b.order || a.dir.localeCompare(b.dir));
}

export function getModule(moduleSlug: string): Module | null {
  return getModules().find((m) => m.slug === moduleSlug) ?? null;
}

/** Flat, ordered list of every lesson across modules (used for prev/next). */
export function getAllLessons(): Lesson[] {
  return getModules().flatMap((m) => m.lessons);
}

export function getLesson(moduleSlug: string, lessonSlug: string) {
  const mod = getModule(moduleSlug);
  const lesson = mod?.lessons.find((l) => l.slug === lessonSlug);
  if (!mod || !lesson) return null;

  const source = fs.readFileSync(path.join(ROOT, mod.dir, lesson.file), "utf8");
  const { content } = matter(source);

  const all = getAllLessons();
  const i = all.findIndex((l) => l.moduleSlug === moduleSlug && l.slug === lessonSlug);
  return {
    module: mod,
    lesson,
    content,
    prev: i > 0 ? all[i - 1] : null,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
  };
}

/** Progress rows are keyed by "module/lesson" so slugs stay unique across modules. */
export function progressKey(l: Pick<Lesson, "moduleSlug" | "slug">) {
  return `${l.moduleSlug}/${l.slug}`;
}
