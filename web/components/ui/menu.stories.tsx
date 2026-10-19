import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "@/stories/section";
import { Menu, MenuLink, MenuSeparator } from "./menu";
import { NavItem, NavList } from "./nav-item";

const meta = {
  title: "Navigation/Menu",
  component: Menu,
  subcomponents: { MenuLink, MenuSeparator },
  args: {
    label: "More",
    defaultOpen: false,
    children: null,
  },
  argTypes: {
    label: { control: "text" },
    defaultOpen: { control: "boolean" },
    children: { table: { disable: true } },
  },
  /* The trigger is a NavItem, so every story sits in a NavList */
  render: (args) => (
    <div className="min-h-64">
      <NavList aria-label="Example">
        <NavItem href="#">Pathways</NavItem>
        <NavItem href="#">Courses</NavItem>
        <Menu {...args}>
          <MenuLink href="#docs">Documentation</MenuLink>
          <MenuLink href="#glossary" sub current>
            Glossary
          </MenuLink>
          <MenuSeparator />
          <MenuLink href="#about">About</MenuLink>
        </Menu>
      </NavList>
    </div>
  ),
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The trigger in a row, closed and open. Hover or focus the trigger to open it; arrow keys move through links. */
export const All: Story = {
  render: (args) => (
    <div className="grid gap-l">
      <Section title="closed">
        <NavList aria-label="Closed">
          <NavItem href="#">Pathways</NavItem>
          <Menu {...args} label="More">
            <MenuLink href="#docs">Documentation</MenuLink>
            <MenuLink href="#about">About</MenuLink>
          </Menu>
        </NavList>
      </Section>
      <Section title="as the first item">
        <NavList aria-label="Menu first">
          <Menu {...args} label="More">
            <MenuLink href="#docs">Documentation</MenuLink>
            <MenuLink href="#about">About</MenuLink>
          </Menu>
          <NavItem href="#">Pathways</NavItem>
        </NavList>
      </Section>
      <Section title="open: children, a separator, the current page and an external link">
        <div className="min-h-72">
          <NavList aria-label="Open">
            <NavItem href="#pathways">Pathways</NavItem>
            <Menu {...args} label="More" defaultOpen>
              <MenuLink href="#docs">Documentation</MenuLink>
              <MenuLink href="#glossary" sub current>
                Glossary
              </MenuLink>
              <MenuLink href="#reference" sub>
                Reference
              </MenuLink>
              <MenuSeparator />
              <MenuLink href="#about">About</MenuLink>
              <MenuLink href="https://docs.evefrontier.com/">Builder docs</MenuLink>
            </Menu>
          </NavList>
        </div>
      </Section>
    </div>
  ),
};

export const Playground: Story = {};
