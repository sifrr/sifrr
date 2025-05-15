import { html, ref } from '@/index';
import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta<{}> = {
  title: 'Sifrr/Template/Controlled'
};

export default meta;
type Story = StoryObj<{}>;

export const Primary: Story = {
  render: () => {
    const value = ref('input');
    const tavalue = ref('textarea');
    const cevalue = ref('');
    const a = html<{}>`
      <input
        :value=${() => value.value}
        ::oninput=${(e: InputEvent) => {
          value.value = (e.target as HTMLInputElement)?.value;
        }}
      />
      <textarea
        :value=${() => tavalue.value}
        ::oninput=${(e: InputEvent) => {
          tavalue.value = (e.target as HTMLTextAreaElement).value;
        }}
      ></textarea>
      <div
        contenteditable
        ::oninput=${(e: InputEvent) => {
          cevalue.value = (e.target as HTMLDivElement).textContent ?? '';
        }}
      >
        ${() => cevalue.value}
      </div>
      <p>${() => value.value}</p>
      <p>${() => tavalue.value}</p>
      <p>${() => cevalue.value}</p>
    `({}, undefined, [value, tavalue, cevalue]);

    const div = document.createElement('div');
    div.append(...a);

    return div;
  },
  play: ({ canvasElement, canvas }) => {}
};
