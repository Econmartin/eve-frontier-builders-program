import type { ReactNode } from "react";

/** A labelled block in an overview story. */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-xs">
      <h2 className="text-step--1 font-bold text-muted first-letter:uppercase">{title}</h2>
      {children}
    </section>
  );
}
