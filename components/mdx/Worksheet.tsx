"use client";

import { createContext, useContext, useId } from "react";

const WorksheetCtx = createContext(false);

export function Worksheet({ title = "Worksheet", children }: { title?: string; children: React.ReactNode }) {
  return (
    <WorksheetCtx.Provider value={true}>
      <section className="worksheet" aria-label={title}>
        <div className="worksheet__head">
          <span className="label label--accent">Exercise</span>
          <h4>{title}</h4>
        </div>
        {children}
      </section>
    </WorksheetCtx.Provider>
  );
}

/** Replaces `li` inside MDX. Inside a <Worksheet>, list items become checkboxes. */
export function ListItem(props: React.LiHTMLAttributes<HTMLLIElement>) {
  const inWorksheet = useContext(WorksheetCtx);
  const id = useId();
  if (!inWorksheet) return <li {...props} />;
  const { children, ...rest } = props;
  return (
    <li {...rest}>
      <label className="worksheet__item" htmlFor={id}>
        <input id={id} type="checkbox" />
        <span>{children}</span>
      </label>
    </li>
  );
}
