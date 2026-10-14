import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "../section";
import { root, theme, tokens, type Group } from "./theme";
import { useToken } from "./tokens";

const semantic = tokens(theme, "--color-");
const primitives = tokens(root, "--neutral-", "--orange-");

function Swatch({ name, prefix }: { name: string; prefix: string }) {
  const value = useToken(name);
  return (
    <div className="grid w-36 gap-3xs">
      <div className="h-20 border border-line" style={{ background: `var(${name})` }} />
      <code className="text-step--2">{name.slice(prefix.length)}</code>
      <code className="text-step--2 text-muted">{value}</code>
    </div>
  );
}

function Palette({ groups, prefix }: { groups: Group[]; prefix: string }) {
  return (
    <div className="grid gap-l">
      {groups.map(({ heading, tokens }) => (
        <Section key={heading} title={heading}>
          <div className="flex flex-wrap gap-s">
            {tokens.map(({ name }) => (
              <Swatch key={name} name={name} prefix={prefix} />
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}

const meta = {
  title: "Foundation/Colors",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** The tokens components use, grouped as in theme.css. Switch the theme in the toolbar to see the dark values. */
export const Semantic: Story = {
  render: () => <Palette groups={semantic} prefix="--color-" />,
};

/** The raw scales the semantic tokens draw from. These do not change with the theme. */
export const Primitives: Story = {
  render: () => <Palette groups={primitives} prefix="--" />,
};
