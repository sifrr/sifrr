import { createElement } from '@/index';
import { ParentElement } from '@/stories/elements';
import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta<unknown> = {
  title: 'Sifrr/Dom/Parent-Child'
};

export default meta;
type Story = StoryObj<unknown>;

export const Primary: Story = {
  render: () => {
    return createElement(ParentElement, {});
  }
};
