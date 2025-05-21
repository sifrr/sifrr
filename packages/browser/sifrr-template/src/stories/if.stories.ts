import { html, ref } from '@/index';
import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta<{}> = {
  title: 'Sifrr/Template/If-show'
};

export default meta;
type Story = StoryObj<{}>;

export const Primary: Story = {
  render: () => {
    const ifref = ref(true);
    let i = 0,
      j = 0;
    const temp1 = html`<div :if=${() => ifref.value}>
        If thing
        ${() => {
          return 'banger' + i++;
        }}
      </div>
      <button ::onclick=${() => (ifref.value = !ifref.value)}>Toggle if</button>`({}, undefined);
    temp1.addRef(ifref);
    const div = document.createElement('div');
    div.append(...temp1);

    return div;
  },
  play: ({ canvasElement, canvas }) => {}
};
