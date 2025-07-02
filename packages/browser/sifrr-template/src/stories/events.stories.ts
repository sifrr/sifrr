import { html } from '@/index';
import type { Meta, StoryObj } from '@storybook/html';
import { fn } from '@storybook/test';

const meta: Meta<unknown> = {
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
      <div
        @click=${({ click }: { click: () => void }) => click}
        :@customevent=${console.log}
        :@dblclick=${console.log}
      >
        Click
      </div>
      <br />
      <div :@touchstart=${args.touchstart} :@mousedown=${args.touchstart}>Touch start</div>
      <br />
      <div :@mouseenter=${args.mouseenter} :@mouseleave=${args.mouseleave}>Mouse enter</div>
      <br />
      <div style="padding: 20px" :@click=${args.click}>
        <div :@click=${args.click}>Nested</div>
      </div>
      <div style="padding: 20px" :@click=${args.click}>
        <div
          :@click=${(e: MouseEvent, tgt) => {
            console.log(e, tgt);
            e.stopPropagation();
          }}
        >
          Nested Stop propogation
        </div>
      </div>
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
    click: console.log,
    touchstart: fn(),
    mouseenter: fn(),
    mouseleave: fn()
  }
};
