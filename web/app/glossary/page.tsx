import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui";

export const metadata: Metadata = { title: "Glossary" };

export default function Glossary() {
  return (
    <main className="container gutter pt-m pb-xl-2xl">
      <Breadcrumbs items={[{ label: "Documentation", href: "/docs" }, { label: "Glossary" }]} />
      <h1 className="mt-xs font-heading text-step-4">Glossary</h1>
      <p className="mt-s text-muted">List of glossary.</p>
    </main>
  );
}
