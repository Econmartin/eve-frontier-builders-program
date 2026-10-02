import type { Metadata } from "next";

export const metadata: Metadata = { title: "Glossary" };

export default function Glossary() {
  return (
    <main className="container gutter pt-m pb-xl-2xl">
      <h1 className="font-heading text-step-4">Glossary</h1>
      <p className="mt-s text-muted">List of glossary.</p>
    </main>
  );
}
