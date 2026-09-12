import Link from "next/link";
import { redirect } from "next/navigation";
import { currentEmail } from "@/auth";
import { getAccess } from "@/lib/access";

export default async function Home() {
  const email = await currentEmail();
  if (email) {
    const access = await getAccess(email);
    if (access.allowed) redirect("/library");
  }

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <span className="label label--accent">The Adept Library</span>
          <h1>Practical AI literacy, written down.</h1>
          <p className="lede">
            Short, plain-language lessons for owner-operators who want to use AI tools well,
            without the hype, and without handing the keys to a vendor. The Library is included
            with <strong>Advisor on Call</strong>.
          </p>
          <div className="actions">
            <Link href="/login" className="btn">
              Sign in
            </Link>
            <Link href="/join" className="btn btn--ghost">
              Join
            </Link>
          </div>
        </div>
      </section>
      <section className="wrap">
        <div className="grid3">
          <div>
            <span className="label">01</span>
            <h3>Know the tool</h3>
            <p className="muted">What a model actually is, what it is good at, and where it will quietly let you down.</p>
          </div>
          <div>
            <span className="label">02</span>
            <h3>Work the tool</h3>
            <p className="muted">Prompts, worksheets and habits you can put to use in your business this week.</p>
          </div>
          <div>
            <span className="label">03</span>
            <h3>Run the shop</h3>
            <p className="muted">Policies, guardrails and judgment calls for putting AI in front of staff and customers.</p>
          </div>
        </div>
        <p className="muted" style={{ marginTop: "2rem" }}>
          Already a Working Session client? Your 90 days of access is granted by Aaron.{" "}
          <Link href="/login">Sign in</Link> with the email you booked with.
        </p>
      </section>
    </>
  );
}
