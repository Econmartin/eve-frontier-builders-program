import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "@/stories/section";
import { ThemeToggle } from "./theme-toggle";

const meta = {
  title: "Actions/ThemeToggle",
  component: ThemeToggle,
} satisfies Meta<typeof ThemeToggle>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The theme lives on the page, so one toggle shows both states: press it, or
 * switch the toolbar's theme, and the body slides across the sun. Hover and
 * keyboard focus light the mark.
 */
export const All: Story = {
  render: () => (
    <Section title="on the page">
      <ThemeToggle />
    </Section>
  ),
};

export const Playground: Story = {};
