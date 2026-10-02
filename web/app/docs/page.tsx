import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documentation" };

export default function Documentation() {
  return (
    <main className="container gutter pt-m pb-xl-2xl">
      <h1 className="font-heading text-step-4">Documentation</h1>
      <p className="mt-s text-muted">List of documentation.</p>
    </main>
  );
}
