import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "../section";
import { useToken } from "./tokens";

const semantic = [
  { title: "Surfaces and ink", tokens: ["background", "foreground", "card", "card-secondary"] },
  { title: "Lines and secondary text", tokens: ["line", "trim", "muted", "control-line"] },
  {
    title: "Accent",
    tokens: ["accent", "accent-hover", "accent-pressed", "accent-keyline", "accent-text", "text-on-accent"],
  },
  { title: "Tinted notice", tokens: ["tint-background", "tint-border", "tint-text"] },
  { title: "Status", tokens: ["info", "warning", "danger"] },
  {
    title: "Artwork",
    tokens: [
      "illustration-paper",
      "illustration-ink",
      "illustration-line",
      "illustration-grey",
      "illustration-grey-deep",
      "illustration-hatch",
      "illustration-accent",
    ],
  },
];

const primitives = [
  { title: "Neutral", tokens: ["neutral-crude", "neutral-cream"] },
  {
    title: "Orange",
    tokens: ["50", "100", "200", "300", "400", "500", "600", "650", "700", "800", "900", "950"].map(
      (step) => `orange-${step}`,
    ),
  },
];

function Swatch({ variable, label }: { variable: string; label: string }) {
  const value = useToken(variable);
  return (
    <div className="grid w-36 gap-3xs">
      <div className="h-20 border border-line" style={{ background: `var(${variable})` }} />
      <code className="text-step--2">{label}</code>
      <code className="text-step--2 text-muted">{value}</code>
    </div>
  );
}

function Palette({ groups, prefix }: { groups: typeof semantic; prefix: string }) {
  return (
    <div className="grid gap-l">
      {groups.map(({ title, tokens }) => (
        <Section key={title} title={title}>
          <div className="flex flex-wrap gap-s">
            {tokens.map((token) => (
              <Swatch key={token} variable={`${prefix}${token}`} label={token} />
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

/** The tokens components use. Switch the theme in the toolbar to see the dark values. */
export const Semantic: Story = {
  render: () => <Palette groups={semantic} prefix="--color-" />,
};

/** The raw scales the semantic tokens draw from. These do not change with the theme. */
export const Primitives: Story = {
  render: () => <Palette groups={primitives} prefix="--" />,
};
