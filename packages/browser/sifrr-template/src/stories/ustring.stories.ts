import createUniqueString from '@/ustring';
import type { Meta, StoryObj } from '@storybook/html';
import { expect } from '@storybook/test';

const meta: Meta<{}> = {
  title: 'Sifrr/Template/UString'
};

export default meta;
type Story = StoryObj<{}>;

export const Primary: Story = {
  render: () => {
    const text = document.createTextNode(createUniqueString(10));

    return text;
  },
  play: ({ canvasElement, canvas }) => {
    expect(canvasElement.textContent?.length).toEqual(10);
  }
};
