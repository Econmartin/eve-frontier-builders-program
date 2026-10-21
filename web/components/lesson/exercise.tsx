import type { ComponentType } from "react";
import { Plate } from "@/components/ui";

function ComingSoon({ title }: { title: string }) {
  return (
    <Plate as="section" aria-label={`Exercise: ${title}`} className="mt-m px-s py-m">
      <p className="font-heading text-step--2 font-bold tracking-[0.04em] text-muted uppercase">Exercise</p>
      <p className="mt-2xs text-step-1 font-bold">{title}</p>
      <p className="mt-2xs text-muted">This exercise isn&rsquo;t built yet.</p>
    </Plate>
  );
}

/** Exercises a lesson can place with an `exercise` code block, by ID. */
const exercises: Record<string, ComponentType> = {
  "feral-vending": () => <ComingSoon title="Feral Data vending machine" />,
};

export function Exercise({ id }: { id: string }) {
  const Component = exercises[id];
  if (!Component) throw new Error(`No exercise with the ID "${id}"`);
  return <Component />;
}
