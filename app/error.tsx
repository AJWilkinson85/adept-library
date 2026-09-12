"use client";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="wrap narrow">
      <span className="label label--accent">Error</span>
      <h1>Something broke.</h1>
      <p className="lede">
        {process.env.NODE_ENV === "development"
          ? error.message
          : "We hit a problem loading this page. Please try again, or email hello@adeptadvisors.com if it keeps happening."}
      </p>
      <button type="button" className="btn" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
