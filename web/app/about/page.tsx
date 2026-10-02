import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <main className="container gutter pt-m pb-xl-2xl">
      <h1 className="font-heading text-step-4">About</h1>
      <p className="mt-s text-muted">About the project.</p>
    </main>
  );
}
