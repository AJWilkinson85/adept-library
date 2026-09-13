import type { Metadata } from "next";
import Link from "next/link";
import { requireAccess } from "@/lib/require-access";

export const metadata: Metadata = { title: "Start here" };

const paths = [
  {
    who: "You own the business",
    why: "You decide what the tool is allowed to touch. Start with judgment, then the two places money leaks.",
    steps: [
      ["know-the-tool/what-a-model-is", "What a model is"],
      ["ask-well/the-business-brief", "Write your business brief once"],
      ["rules-of-the-road/what-never-goes-in", "What never goes into the tool"],
      ["quotes-and-proposals/notes-to-scope", "From notes to scope"],
      ["thinking-with-it/the-friday-review", "The Friday review"],
    ],
  },
  {
    who: "You run the office",
    why: "You touch the inbox, the invoices, and the books every day. That is where the hours come back first.",
    steps: [
      ["ask-well/the-business-brief", "Write your business brief once"],
      ["the-inbox/triage", "Triage: what needs you and what doesn't"],
      ["the-inbox/drafts-in-your-voice", "Drafts in your voice"],
      ["the-books/categorizing", "Categorizing transactions"],
      ["when-it-goes-wrong/the-invoice-nobody-paid", "The invoice nobody paid"],
    ],
  },
  {
    who: "You are in the field or on the phone",
    why: "Customers, schedules, and the moments that go sideways. Short lessons you can use between jobs.",
    steps: [
      ["know-the-tool/when-it-is-wrong", "How to tell when it's wrong"],
      ["the-schedule/telling-customers", "Telling customers when to expect you"],
      ["the-schedule/when-the-day-falls-apart", "When the day falls apart at 9am"],
      ["when-it-goes-wrong/the-complaint", "The complaint"],
      ["your-team/procedures-from-a-walkthrough", "Procedures from a walkthrough"],
    ],
  },
];

export default async function StartPage() {
  await requireAccess("/start");
  return (
    <div className="wrap">
      <span className="label label--accent">Start here</span>
      <h1>Pick the path that matches your job.</h1>
      <p className="lede">
        Thirty-six lessons is a lot. Nobody needs all of them this month. Each path below is five
        lessons, about an hour of reading, chosen for the seat you sit in. Do the worksheets; that
        is where it sticks.
      </p>
      <div className="grid3">
        {paths.map((p) => (
          <div className="card" key={p.who}>
            <h3>{p.who}</h3>
            <p className="muted">{p.why}</p>
            <ol style={{ paddingLeft: "1.2em", margin: "0.5rem 0 0" }}>
              {p.steps.map(([slug, title]) => (
                <li key={slug} style={{ margin: "0.35rem 0" }}>
                  <Link href={`/library/${slug}`}>{title}</Link>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
      <p className="muted" style={{ marginTop: "2rem" }}>
        Every recipe in the Library assumes you have a business brief. If you skip everything else,
        do <Link href="/library/ask-well/the-business-brief">that one</Link>. Then keep a single
        document called &ldquo;Prompt library&rdquo; and paste each recipe into it as you go, with
        its CHECK line. That document is the thing you actually own at the end.
      </p>
    </div>
  );
}
