import { createElement } from '@/index';
import { ControlledInputs } from '@/stories/elements';
import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta<unknown> = {
  title: 'Sifrr/Dom/Controlled Inputs'
};

export default meta;
type Story = StoryObj<unknown>;

export const Primary: Story = {
  render: () => {
    return createElement(ControlledInputs, {});
  },
  play: async () => {}
};
