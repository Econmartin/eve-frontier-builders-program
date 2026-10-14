import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "../section";
import { useComputedStyles, useToken } from "./tokens";

const steps = ["3xs", "2xs", "xs", "s", "m", "l", "xl", "2xl", "3xl"];
const pairs = ["3xs-2xs", "2xs-xs", "xs-s", "s-m", "m-l", "l-xl", "xl-2xl", "2xl-3xl", "s-l"];
const layout = ["--breakpoint-sm", "--breakpoint-md", "--breakpoint-lg", "--breakpoint-xl", "--container-grid"];
const cuts = ["--cut-sm", "--cut-md"];
const layers = ["--layer-raised", "--layer-sticky", "--layer-scrim", "--layer-menu", "--layer-toast"];

function Bar({ token }: { token: string }) {
  const [ref, [width]] = useComputedStyles<HTMLDivElement>("width");
  return (
    <div className="grid grid-cols-[6rem_1fr] items-center gap-s">
      <code className="text-step--2 text-muted">
        {token}
        <br />
        {width}
      </code>
      <div ref={ref} className="h-3 bg-accent" style={{ width: `var(--spacing-${token})` }} />
    </div>
  );
}

function Value({ variable }: { variable: string }) {
  const value = useToken(variable);
  return (
    <div className="flex gap-s">
      <code className="w-40 text-step--2 text-muted">{variable}</code>
      <code className="text-step--2">{value}</code>
    </div>
  );
}

const meta = {
  title: "Foundation/Spacing",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** The fluid space scale, measured at the current viewport width. */
export const Scale: Story = {
  render: () => (
    <div className="grid gap-l">
      <Section title="Steps">
        <div className="grid gap-xs">
          {steps.map((token) => (
            <Bar key={token} token={token} />
          ))}
        </div>
      </Section>
      <Section title="Pairs">
        <div className="grid gap-xs">
          {pairs.map((token) => (
            <Bar key={token} token={token} />
          ))}
        </div>
      </Section>
    </div>
  ),
};

export const Layout: Story = {
  render: () => (
    <div className="grid gap-l">
      <Section title="Breakpoints and container">
        {layout.map((variable) => (
          <Value key={variable} variable={variable} />
        ))}
      </Section>
      <Section title="Corner cuts">
        {cuts.map((variable) => (
          <Value key={variable} variable={variable} />
        ))}
      </Section>
      <Section title="Layers">
        {layers.map((variable) => (
          <Value key={variable} variable={variable} />
        ))}
      </Section>
    </div>
  ),
};
