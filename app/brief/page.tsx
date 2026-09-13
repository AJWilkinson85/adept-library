import type { Metadata } from "next";
import Link from "next/link";
import { Callout } from "@/components/mdx/Callout";
import { Prompt } from "@/components/mdx/Prompt";
import { Worksheet } from "@/components/mdx/Worksheet";

export const metadata: Metadata = {
  title: "Write your business brief in five minutes",
  description:
    "The free guide from Adept Advisors: one prompt that interviews you and writes the one-page brief every AI tool you use should read first.",
};

export default function BriefPage() {
  return (
    <div className="wrap">
      <article className="lesson" style={{ maxWidth: 720 }}>
        <span className="label label--accent">Free guide</span>
        <h1>Write your business brief in five minutes.</h1>
        <p className="lede">
          The single most useful thing you can do before using AI in your business. One page,
          written once, pasted into every real conversation so the tool never starts from zero.
        </p>

        <div className="prose">
          <h2>The problem with starting from zero</h2>
          <p>
            The model forgets you between conversations. Retyping context every time is the reason
            most people give up after a week. The fix is a single document, written once and refined
            over a month, that you paste at the top of any real work. Every serious user of these
            tools has one, whether they call it that or not.
          </p>

          <h2>What goes in it</h2>
          <p>Keep it to one page. Plain text. Six headings.</p>
          <p>
            <strong>Who we are.</strong> Business name, what you sell, where, to whom, how long you
            have been at it, how many people. Two sentences.
          </p>
          <p>
            <strong>How we sound.</strong> Three or four adjectives, then two short real examples of
            your writing. &ldquo;Direct, warm, no corporate language. We say &lsquo;you&rsquo; a lot.
            We never say &lsquo;reach out.&rsquo;&rdquo;
          </p>
          <p>
            <strong>How we work.</strong> The rules a new hire learns in week one. Payment terms.
            What you do not do. Minimums. Service area. Lead times. Warranty.
          </p>
          <p>
            <strong>Prices and offers.</strong> Standard prices or ranges, packages, any current
            offer.
          </p>
          <p>
            <strong>People.</strong> First names and roles of anyone who might be mentioned.
          </p>
          <p>
            <strong>Never.</strong> Things the tool must never do or say on your behalf: quote a
            price not on the list, promise a date, offer a discount, use exclamation points.
          </p>

          <Callout kind="warn">
            Do not put customer names, account numbers, or anything from someone else&rsquo;s
            private information in the brief. It is about you, and it will be pasted a lot.
          </Callout>

          <h2>Get a first draft in five minutes</h2>
          <p>
            Open Claude or ChatGPT, paste this, and answer the questions honestly and briefly. Then
            edit the result by hand. The first version is 80 percent right; a month of use gets it
            to 95.
          </p>

          <Prompt title="Draft my business brief">
            Interview me to build a one-page &ldquo;business brief&rdquo; I can paste into future
            conversations so you understand my business. Ask me one question at a time, no more
            than twelve questions total, covering: what we do and for whom, how we sound (I&rsquo;ll
            paste examples), our working rules (terms, minimums, service area, lead times), prices
            or packages, key people and roles, and things you must never do on our behalf. When you
            have enough, write the brief in plain text under 400 words with those six headings.
          </Prompt>

          <h2>How to use it</h2>
          <p>
            Save it somewhere you can copy from in two seconds. Then, any time you ask an AI tool
            for something real (an email, a quote, a policy, a summary of your numbers), start the
            message with &ldquo;Here is my business brief:&rdquo; and paste. Notice how different
            the answers get.
          </p>

          <Worksheet title="Do it today">
            <ul>
              <li>Run the prompt. Answer every question in a sentence or two.</li>
              <li>Edit the draft until every line is true. Cut anything you would not say out loud.</li>
              <li>Paste it into your next three real requests and compare the results to before.</li>
              <li>Put a reminder on the calendar to revise it in 30 days.</li>
            </ul>
          </Worksheet>

          <h2>What this is a piece of</h2>
          <p>
            This is lesson two of thirty-six in the Adept Library, the written version of the
            Working Session: a half day, on your real inbox, quotes, and books, with your team. If
            you want to see what the rest looks like, book a 30-minute call. No pitch, no prep.
          </p>
          <p>
            <a className="btn" href="https://adeptadvisors.com/#book">
              Book an intro call
            </a>{" "}
            <Link className="btn btn--ghost" href="/adept-business-brief.pdf">
              Download the PDF
            </Link>
          </p>
        </div>
      </article>
    </div>
  );
}
