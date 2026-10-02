import { Suspense } from "react";
import type { Metadata } from "next";
import { Results } from "./results";

export const metadata: Metadata = { title: "Search" };

export default function Search() {
  return (
    <main className="container gutter pt-m pb-xl-2xl">
      <h1 className="font-heading text-step-4">Search</h1>
      <Suspense fallback={null}>
        <Results />
      </Suspense>
    </main>
  );
}
