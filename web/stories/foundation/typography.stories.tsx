import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "../section";
import { theme, tokens, type Token } from "./theme";
import { useComputedStyles } from "./tokens";

const steps = tokens(theme, "--text-step-")
  .flatMap((group) => group.tokens)
  .filter(({ name }) => !name.endsWith("--line-height"))
  .reverse();
const families = tokens(theme, "--font-").flatMap((group) => group.tokens);
const headings = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

function Step({ name, value }: Token) {
  const [ref, [size, line]] = useComputedStyles<HTMLParagraphElement>("font-size", "line-height");
  return (
    <div className="grid grid-cols-[8rem_1fr] items-baseline gap-s border-b border-line pb-xs">
      <code className="text-step--2 text-muted">
        {name.slice("--text-".length)}
        <br />
        {size} / {line}
        <br />
        {value}
      </code>
      <p ref={ref} style={{ fontSize: `var(${name})`, lineHeight: `var(${name}--line-height)` }}>
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
        <Step key={step.name} {...step} />
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
      {families.map(({ name, value }) => (
        <Section key={name} title={`${name.slice("--font-".length)} · ${value}`}>
          <p className="text-step-1" style={{ fontFamily: `var(${name})` }}>
            The quick brown fox jumps over the lazy dog
          </p>
        </Section>
      ))}
    </div>
  ),
};
