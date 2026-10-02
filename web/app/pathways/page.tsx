import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pathways" };

export default function Pathways() {
  return (
    <main className="container gutter pt-m pb-xl-2xl">
      <h1 className="font-heading text-step-4">Pathways</h1>
      <p className="mt-s text-muted">List of pathways.</p>
    </main>
  );
}
