import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { Section } from "../section";
import { root, theme, tokens, type Group, type Token } from "./theme";
import { useComputedStyles, useToken } from "./tokens";

const space = tokens(theme, "--spacing-");
const layout = [...tokens(theme, "--breakpoint-", "--container-"), ...tokens(root, "--cut-", "--layer-")];

function Bar({ name, value }: Token) {
  const [ref, [width]] = useComputedStyles<HTMLDivElement>("width");
  return (
    <div className="grid grid-cols-[6rem_1fr] items-center gap-s">
      <code className="text-step--2 text-muted">
        {name.slice("--spacing-".length)}
        <br />
        {width}
      </code>
      <div className="grid gap-3xs">
        <div ref={ref} className="h-3 bg-accent" style={{ width: `var(${name})` }} />
        <code className="text-step--3 text-muted">{value}</code>
      </div>
    </div>
  );
}

function Value({ name }: Token) {
  const value = useToken(name);
  return (
    <div className="flex gap-s">
      <code className="w-40 text-step--2 text-muted">{name}</code>
      <code className="text-step--2">{value}</code>
    </div>
  );
}

function Groups({ groups, render }: { groups: Group[]; render: (token: Token) => ReactNode }) {
  return (
    <div className="grid gap-l">
      {groups.map(({ heading, tokens }) => (
        <Section key={heading} title={heading}>
          <div className="grid gap-xs">{tokens.map(render)}</div>
        </Section>
      ))}
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
  render: () => <Groups groups={space} render={(token) => <Bar key={token.name} {...token} />} />,
};

export const Layout: Story = {
  render: () => <Groups groups={layout} render={(token) => <Value key={token.name} {...token} />} />,
};
