"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui";
import type { GlossaryTerm } from "@/lib/content/load";

const alphabet = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
const letterOf = (title: string) => title[0].toUpperCase();
const slugOf = (href: string) => href.split("/").filter(Boolean).at(-1);

/** Every glossary term, grouped by letter, with a filter over names, aliases and definitions. */
export function GlossaryIndex({ terms }: { terms: Omit<GlossaryTerm, "file">[] }) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim().toLowerCase());

  const shown = deferred
    ? terms.filter((term) =>
        [term.title, term.description, ...term.aliases].some((text) => text.toLowerCase().includes(deferred)),
      )
    : terms;
  const letters = new Set(shown.map((term) => letterOf(term.title)));

  return (
    <div className="mt-l">
      <Field
        type="search"
        placeholder="Filter terms"
        aria-label="Filter glossary terms"
        shortcut="/"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="max-w-md"
      />
      <p aria-live="polite" className="mt-2xs text-step--1 text-muted">
        {deferred ? `${shown.length} of ${terms.length} terms` : `${terms.length} terms`}
      </p>

      <nav aria-label="Glossary letters" className="mt-s">
        <ul role="list" className="flex flex-wrap gap-1 font-heading text-step--1">
          {alphabet.map((letter) => (
            <li key={letter}>
              {letters.has(letter) ? (
                <a href={`#letter-${letter}`} className="grid size-8 place-items-center text-accent-text hover:bg-card">
                  {letter}
                </a>
              ) : (
                <span aria-hidden="true" className="grid size-8 place-items-center text-muted opacity-50">
                  {letter}
                </span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {shown.length === 0 && <p className="mt-m text-muted">No terms match &ldquo;{query.trim()}&rdquo;.</p>}

      {alphabet
        .filter((letter) => letters.has(letter))
        .map((letter) => (
          <section key={letter} aria-labelledby={`letter-${letter}`} className="mt-l">
            <h2 id={`letter-${letter}`} className="scroll-mt-l border-b-2 border-foreground pb-2xs text-step-5 leading-none">
              {letter}
            </h2>
            <dl>
              {shown
                .filter((term) => letterOf(term.title) === letter)
                .map((term) => (
                  <div
                    key={term.href}
                    id={slugOf(term.href)}
                    className="grid scroll-mt-l gap-x-m gap-y-3xs border-b border-line px-2xs py-s target:bg-tint-background target:shadow-[inset_3px_0_0_var(--color-accent)] sm:grid-cols-[minmax(0,14rem)_1fr]"
                  >
                    <dt>
                      <Link href={term.href} className="font-bold text-accent-text underline underline-offset-2 hover:decoration-2">
                        {term.title}
                      </Link>
                    </dt>
                    <dd className="text-step--1">
                      <p className="max-w-[68ch] text-muted">{term.description}</p>
                      {term.aliases.length > 0 && <p className="mt-3xs text-step--2 text-muted">Also: {term.aliases.join(", ")}</p>}
                    </dd>
                  </div>
                ))}
            </dl>
          </section>
        ))}
    </div>
  );
}
