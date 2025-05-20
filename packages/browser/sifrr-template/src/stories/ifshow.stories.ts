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
    const showref = ref(true);
    let i = 0,
      j = 0;
    const temp1 = html`<div :if=${() => ifref.value}>
        If thing
        ${() => {
          return 'banger' + i++;
        }}
      </div>
      <button ::onclick=${() => (ifref.value = !ifref.value)}>Toggle if</button>`({}, undefined, [
      ifref
    ]);
    const temp2 = html`<div :show=${() => showref.value}>
        Show thing
        ${() => {
          return 'banger' + j++;
        }}
      </div>
      <button ::onclick=${() => (showref.value = !showref.value)}>Toggle Show</button>`(
      {},
      undefined,
      [showref]
    );

    const div = document.createElement('div');
    div.append(...temp1);
    div.append(...temp2);

    return div;
  },
  play: ({ canvasElement, canvas }) => {}
};
