import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Sheet } from "./sheet";

/* The sheet takes any content; the top bar fills it with its search, tabs and links */
const content = (
  <p className="text-step--1 text-muted">
    Sheet content. The top bar fills this with its search, tabs and links.
  </p>
);

const meta = {
  title: "Navigation/Sheet",
  component: Sheet,
  args: {
    label: "Menu",
    header: <span className="font-heading text-step-2 font-bold">EF-B</span>,
    defaultOpen: false,
    onOpenChange: fn(),
    children: content,
  },
  argTypes: {
    label: { control: "text" },
    defaultOpen: { control: "boolean" },
    header: { table: { disable: true } },
    children: { table: { disable: true } },
    open: { table: { disable: true } },
    initialFocus: { table: { disable: true } },
  },
  /* The sheet covers the viewport, so each story gets its own frame in the docs */
  parameters: { layout: "fullscreen", docs: { story: { inline: false, height: "420px" } } },
  /* The trigger sits in a bar laid out like the sheet's own header row, as in
    the top bar, so the dots turn into the cross in place */
  render: (args) => (
    <div className="mx-auto flex min-h-(--bar-height,64px) max-w-grid items-center justify-between gap-s px-s-l">
      {args.header}
      <Sheet {...args} />
    </div>
  ),
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Opened, with the close button where the trigger sat. Escape, the cross, the scrim or a link close it. */
export const Open: Story = {
  args: { defaultOpen: true },
};

/** The dots trigger. Hover and focus are live; it opens into the sheet. */
export const Playground: Story = {};
