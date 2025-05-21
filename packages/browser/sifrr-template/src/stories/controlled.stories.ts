import { html, ref } from '@/index';
import { computed } from '@/template/ref';
import type { Meta, StoryObj } from '@storybook/html';

const meta: Meta<{}> = {
  title: 'Sifrr/Template/Controlled'
};

export default meta;
type Story = StoryObj<{}>;

export const Primary: Story = {
  render: () => {
    const value = ref({ input: 'input', text: 'textarea', contenteditable: '' }, true);
    let i = 0;
    const text = computed(
      () => value.value.input + '---' + value.value.text + '---' + value.value.contenteditable
    );
    (window as any).value = value;
    const a = html<{}>`
      <input
        :value=${() => value.value.input}
        ::oninput=${(e: InputEvent) => {
          value.value.input = (e.target as HTMLInputElement)?.value;
        }}
      />
      <textarea
        :value=${() => value.value.text}
        ::oninput=${(e: InputEvent) => {
          value.value.text = (e.target as HTMLInputElement)?.value;
        }}
      ></textarea>
      <div
        ::oninput=${(e: InputEvent) => {
          value.value.contenteditable = (e.target as HTMLDivElement).textContent ?? '';
        }}
        contenteditable
      >
        ${() => value.value.contenteditable}
      </div>
      <p>${() => text.value}</p>
      <p>${() => i++}</p>
    `({}, undefined, [value]);

    const div = document.createElement('div');
    div.append(...a);

    return div;
  },
  play: ({ canvasElement, canvas }) => {}
};
