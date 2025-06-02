import { createElement } from '@/index';
import { ControlledInputs } from '@/stories/elements';
import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta<{}> = {
  title: 'Sifrr/Dom/Controlled Inputs'
};

export default meta;
type Story = StoryObj<{}>;

export const Primary: Story = {
  render: () => {
    return createElement(ControlledInputs, {});
  },
  play: async ({ canvasElement, canvas }) => {}
};
