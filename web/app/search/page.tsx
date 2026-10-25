import { Suspense } from "react";
import type { Metadata } from "next";
import { getSearchEntries } from "@/lib/curriculum";
import { Results } from "./results";

export const metadata: Metadata = { title: "Search" };

export default function Search() {
  return (
    <main className="mx-auto w-full max-w-grid px-s-l pt-m pb-xl">
      <h1 className="font-heading text-step-4">Search</h1>
      <Suspense fallback={null}>
        <Results entries={getSearchEntries()} />
      </Suspense>
    </main>
  );
}
