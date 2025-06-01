import { createElement, Element, register } from '@/index';
import { ExampleElement } from '@/stories/elements';
import { html } from '@sifrr/template';
import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta<{}> = {
  title: 'Sifrr/Dom/Element'
};

export default meta;
type Story = StoryObj<{}>;

export const Primary: Story = {
  render: () => {
    return createElement(ExampleElement, {});
  },
  play: async ({ canvasElement, canvas }) => {}
};
