import { html, ref } from '@/index';
import { computed } from '@/template/ref';
import type { Meta, StoryObj } from '@storybook/html';
import { expect } from '@storybook/test';

const meta: Meta<{}> = {
  title: 'Sifrr/Template/Controlled'
};

export default meta;
type Story = StoryObj<{}>;

export const Primary: Story = {
  render: () => {
    const value = ref({ deep: { input: 'input', text: 'textarea', contenteditable: '' } }, true);
    let i = 0;
    const text = computed(
      () =>
        value.value.deep.input +
        '---' +
        value.value.deep.text +
        '---' +
        value.value.deep.contenteditable
    );
    (window as any).value = value;
    const a = html<Record<string, never>>`
      <input
        :value=${() => value.value.deep.input}
        ::oninput=${(e: InputEvent) => {
          value.value.deep.input = (e.target as HTMLInputElement)?.value;
        }}
      />
      <textarea
        :value=${() => value.value.deep.text}
        ::oninput=${(e: InputEvent) => {
          value.value.deep.text = (e.target as HTMLInputElement)?.value;
        }}
      ></textarea>
      <div
        ::oninput=${(e: InputEvent) => {
          value.value.deep.contenteditable = (e.target as HTMLDivElement).textContent ?? '';
        }}
        contenteditable
      >
        ${() => value.value.deep.contenteditable}
      </div>
      <p id="values">${() => text.value}</p>
      <p id="count">${() => i++}</p>
    `({}, undefined);
    a.addRef(value);

    const div = document.createElement('div');
    div.append(...a);

    return div;
  },
  play: ({ canvasElement, canvas }) => {
    const values = canvasElement.querySelector('#values');

    const setValues = (v: object) => {
      (window as any).value.value.deep = v;
    };
    const setValue = (k: string, v: string) => {
      (window as any).value.value.deep[k] = v;
    };

    expect(values?.textContent).toEqual('input---textarea---');

    setValue('input', 'input1');
    expect(values?.textContent).toEqual('input1---textarea---');

    setValues({});
    expect(values?.textContent).toEqual('undefined---undefined---undefined');

    setValue('input', 'input2');
    expect(values?.textContent).toEqual('input2---undefined---undefined');

    setValue('text', 'text1');
    expect(values?.textContent).toEqual('input2---text1---undefined');

    setValue('contenteditable', 'contenteditable1');
    expect(values?.textContent).toEqual('input2---text1---contenteditable1');

    expect(canvasElement.querySelector('#count')?.textContent).toEqual('5');
  }
};
