import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "../section";
import { useComputedStyles } from "./tokens";

const steps = [
  { token: "step-5", className: "text-step-5" },
  { token: "step-4", className: "text-step-4" },
  { token: "step-3", className: "text-step-3" },
  { token: "step-2", className: "text-step-2" },
  { token: "step-1", className: "text-step-1" },
  { token: "step-0", className: "text-step-0" },
  { token: "step--1", className: "text-step--1" },
  { token: "step--2", className: "text-step--2" },
  { token: "step--3", className: "text-step--3" },
];

const headings = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

function Step({ token, className }: { token: string; className: string }) {
  const [ref, [size, line]] = useComputedStyles<HTMLParagraphElement>("font-size", "line-height");
  return (
    <div className="grid grid-cols-[8rem_1fr] items-baseline gap-s border-b border-line pb-xs">
      <code className="text-step--2 text-muted">
        {token}
        <br />
        {size} / {line}
      </code>
      <p ref={ref} className={className}>
        Build on the Frontier
      </p>
    </div>
  );
}

function Heading({ level }: { level: (typeof headings)[number] }) {
  const Tag = level;
  const [ref, [size]] = useComputedStyles<HTMLHeadingElement>("font-size");
  return (
    <div className="grid grid-cols-[8rem_1fr] items-baseline gap-s border-b border-line pb-xs">
      <code className="text-step--2 text-muted">
        {level}
        <br />
        {size}
      </code>
      <Tag ref={ref}>Build on the Frontier</Tag>
    </div>
  );
}

const meta = {
  title: "Foundation/Typography",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** The fluid type scale. Sizes are read at the current viewport width; resize to see them move. */
export const Scale: Story = {
  render: () => (
    <div className="grid gap-s">
      {steps.map((step) => (
        <Step key={step.token} {...step} />
      ))}
    </div>
  ),
};

/** Heading elements as the base layer styles them, with no utilities applied. */
export const Headings: Story = {
  render: () => (
    <div className="grid gap-s">
      {headings.map((level) => (
        <Heading key={level} level={level} />
      ))}
    </div>
  ),
};

export const Families: Story = {
  render: () => (
    <div className="grid gap-l">
      <Section title="Heading">
        <p className="font-heading text-step-2 font-bold">The quick brown fox jumps over the lazy dog</p>
      </Section>
      <Section title="Body">
        <p className="font-body text-step-0">
          The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
        </p>
      </Section>
    </div>
  ),
};
