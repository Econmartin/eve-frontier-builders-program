import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Section } from "@/stories/section";
import { Button, type ButtonProps } from "./button";

const variants: NonNullable<ButtonProps["variant"]>[] = ["primary", "secondary"];
const sizes: NonNullable<ButtonProps["size"]>[] = ["sm", "md", "lg"];
const states: { label: string; props: Partial<ButtonProps> }[] = [
  { label: "Default", props: {} },
  { label: "Loading", props: { loading: true } },
  { label: "Disabled", props: { disabled: true } },
];

const meta = {
  title: "Actions/Button",
  component: Button,
  args: {
    children: "Start building",
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
    onClick: fn(),
  },
  argTypes: {
    variant: { control: "radio", options: variants },
    size: { control: "radio", options: sizes },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    type: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Both variants at every size and state. Hover, focus and press are live. */
export const All: Story = {
  render: (args) => (
    <div className="grid gap-xl">
      {variants.map((variant) => (
        <div key={variant} className="grid gap-l">
          <Section title={`${variant}: sizes`}>
            <div className="flex flex-wrap items-center gap-s">
              {sizes.map((size) => (
                <Button key={size} {...args} variant={variant} size={size}>
                  Button {size}
                </Button>
              ))}
            </div>
          </Section>
          <Section title={`${variant}: states`}>
            <div className="flex flex-wrap items-end gap-s">
              {states.map(({ label, props }) => (
                <div key={label} className="grid gap-3xs">
                  <code className="text-step--2 text-muted">{label}</code>
                  <Button {...args} variant={variant} {...props}>
                    {label}
                  </Button>
                </div>
              ))}
            </div>
          </Section>
        </div>
      ))}
    </div>
  ),
};

export const Playground: Story = {};
