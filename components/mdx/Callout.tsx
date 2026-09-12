export function Callout({
  kind = "note",
  title,
  children,
}: {
  kind?: "note" | "warn";
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <aside className={`callout callout--${kind}`}>
      <span className="label">{title ?? (kind === "warn" ? "Watch out" : "Note")}</span>
      {children}
    </aside>
  );
}
