import { html } from '@/index';
import type { Meta, StoryObj } from '@storybook/html';
import { fn } from '@storybook/test';

const meta: Meta<{}> = {
  title: 'Sifrr/Template/Events'
};

export default meta;
type Story = StoryObj<{
  click: () => void;
  touchstart: () => void;
  mouseenter: () => void;
  mouseleave: () => void;
}>;

export const Primary: Story = {
  render: (args) => {
    const Component = html<{
      click: () => void;
    }>`
      <div @click=${({ click }) => click} :@dblclick=${console.log}>Click</div>
      <br />
      <div :@touchstart=${args.touchstart}>Touch start</div>
      <br />
      <div :@mouseenter=${args.mouseenter} :@mouseleave=${args.mouseleave}>Mouse enter</div>
      <br />
    `;

    const element = document.createElement('div');
    element.append(
      ...Component({
        click: args.click
      })
    );

    return element;
  },
  args: {
    click: fn(),
    touchstart: fn(),
    mouseenter: fn(),
    mouseleave: fn()
  }
};
