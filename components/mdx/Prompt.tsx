"use client";

import { useRef, useState } from "react";

export function Prompt({ title = "Prompt", children }: { title?: string; children: React.ReactNode }) {
  const body = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = body.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; select the text so the reader can copy manually.
      const range = document.createRange();
      if (body.current) {
        range.selectNodeContents(body.current);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
    }
  }

  return (
    <section className="prompt" aria-label={title}>
      <div className="prompt__bar">
        <span className="label">{title}</span>
        <button type="button" className="prompt__copy" onClick={copy} aria-live="polite">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="prompt__body" ref={body}>
        {children}
      </div>
    </section>
  );
}
