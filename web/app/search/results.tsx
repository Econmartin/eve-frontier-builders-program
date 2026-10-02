"use client";

import { useSearchParams } from "next/navigation";

/* Reads the query in the browser: a static export has no server to read it at request time */
export function Results() {
  const query = useSearchParams().get("q")?.trim();

  if (!query) {
    return <p className="mt-s text-muted">Type in the search field to look something up.</p>;
  }

  return (
    <>
      <p className="mt-s">
        Results for <strong>{query}</strong>
      </p>
      <p className="mt-xs text-muted">Search isn&apos;t connected yet.</p>
    </>
  );
}
