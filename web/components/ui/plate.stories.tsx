import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "@/stories/section";
import { Plate, type PlateCorners, type PlateCut } from "./plate";

const corners: PlateCorners[] = ["tl", "tr", "br", "bl", "tl-br", "tr-bl"];
const cuts: PlateCut[] = ["sm", "md"];

const meta = {
  title: "Components/Plate",
  component: Plate,
  args: {
    corners: "tr-bl",
    cut: "md",
    children: "Card content",
    className: "p-m",
  },
  argTypes: {
    corners: { control: "select", options: corners },
    cut: { control: "radio", options: cuts },
    keyline: { control: "color" },
    fill: { control: "color" },
    as: { table: { disable: true } },
    style: { table: { disable: true } },
  },
} satisfies Meta<typeof Plate>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Every corner option at both cut sizes. */
export const All: Story = {
  render: (args) => (
    <div className="grid gap-l">
      {cuts.map((cut) => (
        <Section key={cut} title={`cut="${cut}"`}>
          <div className="flex flex-wrap gap-s">
            {corners.map((option) => (
              <Plate key={option} {...args} corners={option} cut={cut} className="min-w-40 p-m">
                <code className="text-step--2">{option}</code>
              </Plate>
            ))}
          </div>
        </Section>
      ))}
    </div>
  ),
};

export const Playground: Story = {};
