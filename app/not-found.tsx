import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap narrow">
      <span className="label label--accent">404</span>
      <h1>Not here.</h1>
      <p className="lede">That page does not exist or has moved.</p>
      <Link href="/library" className="btn">
        Back to the Library
      </Link>
    </div>
  );
}
