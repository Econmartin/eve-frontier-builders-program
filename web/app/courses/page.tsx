import type { Metadata } from "next";

export const metadata: Metadata = { title: "Courses" };

export default function Courses() {
  return (
    <main className="container gutter pt-m pb-xl-2xl">
      <h1 className="font-heading text-step-4">Courses</h1>
      <p className="mt-s text-muted">List of courses.</p>
    </main>
  );
}
