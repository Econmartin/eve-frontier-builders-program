import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "@/stories/section";
import { NavItem, NavList } from "./nav-item";

const links = ["Pathways", "Courses", "More", "Documentation"];

const meta = {
  title: "Navigation/NavItem",
  component: NavItem,
  subcomponents: { NavList },
  args: {
    children: "Courses",
    href: "#",
    current: false,
  },
  argTypes: {
    current: { control: "boolean" },
    href: { control: "text" },
  },
  /* NavItem renders a list item, so every story sits in a NavList */
  render: (args) => (
    <NavList aria-label="Example">
      <NavItem href="#">Pathways</NavItem>
      <NavItem {...args} />
      <NavItem href="#">More</NavItem>
    </NavList>
  ),
} satisfies Meta<typeof NavItem>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Rows of every length, with and without a current page. Hover and focus are live. */
export const All: Story = {
  render: () => (
    <div className="grid gap-l">
      <Section title="current page">
        <NavList aria-label="Current page">
          {links.map((label) => (
            <NavItem key={label} href="#" current={label === "Courses"}>
              {label}
            </NavItem>
          ))}
        </NavList>
      </Section>
      <Section title="no current page">
        <NavList aria-label="No current page">
          {links.map((label) => (
            <NavItem key={label} href="#">
              {label}
            </NavItem>
          ))}
        </NavList>
      </Section>
      {[1, 2, 3].map((count) => (
        <Section key={count} title={`${count} ${count === 1 ? "item" : "items"}`}>
          <NavList aria-label={`${count} items`}>
            {links.slice(0, count).map((label) => (
              <NavItem key={label} href="#">
                {label}
              </NavItem>
            ))}
          </NavList>
        </Section>
      ))}
    </div>
  ),
};

/** The middle item takes the controls, so it shows the notched piece. */
export const Playground: Story = {};
