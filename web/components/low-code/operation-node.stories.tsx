import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Section } from "@/stories/section";
import { OperationNode, operationRoles } from "./nodes";

const meta = {
  title: "Components/Low Code/Operation Node",
  component: OperationNode,
  args: { role: "Require Item", item: "FERAL_DATA", connected: true, execInConnected: true, execOutConnected: true, selected: false },
  argTypes: { role: { control: "select", options: operationRoles } },
} satisfies Meta<typeof OperationNode>;
export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  render: () => (
    <Section title="Move / SDK primitive operation nodes">
      <div className="flex flex-wrap gap-l p-s">
        {operationRoles.map(role => (
          <OperationNode key={role} role={role} connected />
        ))}
        <OperationNode role="Require Item" item="FERAL_DATA" connected={false} execInConnected={false} />
        <OperationNode role="Transfer Item" item="EU_40" connected selected />
      </div>
    </Section>
  ),
};
export const Playground: Story = {};
