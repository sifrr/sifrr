import { createElement } from '@/index';
import { ParentElement } from '@/stories/elements';
import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta<{}> = {
  title: 'Sifrr/Dom/Parent-Child'
};

export default meta;
type Story = StoryObj<{}>;

export const Primary: Story = {
  render: () => {
    return createElement(ParentElement, {});
  },
  play: async ({ canvasElement, canvas }) => {}
};
