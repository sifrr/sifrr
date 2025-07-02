import { html, ref } from '@/index';
import { computed } from '@/template/ref';
import type { Meta, StoryObj } from '@storybook/html';
import { expect } from '@storybook/test';

const meta: Meta<unknown> = {
  title: 'Sifrr/Template/Controlled'
};

export default meta;
type Story = StoryObj<unknown>;

export const Primary: Story = {
  render: () => {
    const value = ref(
      {
        deep: { input: 'input', text: 'textarea', contenteditable: '', select: '', checkbox: true }
      },
      true
    );
    let i = 0;
    const text = computed(
      () =>
        value.value.deep.input +
        '---' +
        value.value.deep.text +
        '---' +
        value.value.deep.contenteditable +
        '---' +
        value.value.deep.checkbox +
        '---' +
        value.value.deep.select
    );
    (window as any).value = value;
    const a = html<Record<string, never>>`
      <input
        class="input"
        :value=${() => value.value.deep.input}
        ::oninput=${(e: InputEvent) => {
          value.value.deep.input = (e.target as HTMLInputElement)?.value;
        }}
      />
      <textarea
        class="textarea"
        :value=${() => value.value.deep.text}
        ::oninput=${(e: InputEvent) => {
          value.value.deep.text = (e.target as HTMLInputElement)?.value;
        }}
      ></textarea>
      <div
        class="content"
        ::oninput=${(e: InputEvent) => {
          value.value.deep.contenteditable = (e.target as HTMLDivElement).textContent ?? '';
        }}
        contenteditable
      >
        ${() => value.value.deep.contenteditable}
      </div>
      <input
        class="checkbox"
        type="checkbox"
        :checked=${() => value.value.deep.checkbox}
        ::oninput=${(e: InputEvent) => {
          value.value.deep.checkbox = (e.target as HTMLInputElement)?.checked;
        }}
      />
      <select
        class="select"
        name="cars"
        id="cars"
        :value=${() => value.value.deep.select}
        ::oninput=${(e: InputEvent) => {
          value.value.deep.select = (e.target as HTMLInputElement)?.value;
        }}
      >
        <option value="volvo">Volvo</option>
        <option value="saab">Saab</option>
        <option value="opel">Opel</option>
        <option value="audi">Audi</option>
      </select>
      <p id="values">${() => text.value}</p>
      <p id="count">${() => i++}</p>
    `({}, undefined);
    a.addRef(value);

    const div = document.createElement('div');
    div.append(...a);

    return div;
  },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector('.input') as HTMLInputElement;
    const textarea = canvasElement.querySelector('.textarea') as HTMLTextAreaElement;
    const contenteditable = canvasElement.querySelector('.content') as HTMLDivElement;
    const checkbox = canvasElement.querySelector('.checkbox') as HTMLInputElement;
    const select = canvasElement.querySelector('.select') as HTMLSelectElement;

    const setValues = (v: object) => {
      (window as any).value.value.deep = v;
    };
    const setValue = (k: string, v: string | boolean) => {
      (window as any).value.value.deep[k] = v;
    };

    const getValues = () => {
      return (
        input.value +
        '---' +
        textarea.value +
        '---' +
        contenteditable.textContent +
        '---' +
        checkbox.checked +
        '---' +
        select.value
      );
    };

    await expect(getValues()).toEqual('input---textarea------true---');

    setValue('input', 'input1');
    await expect(getValues()).toEqual('input1---textarea------true---');

    setValues({});
    await expect(getValues()).toEqual('undefined---undefined------false---');

    setValue('input', 'input2');
    await expect(getValues()).toEqual('input2---undefined------false---');

    setValue('text', 'text1');
    await expect(getValues()).toEqual('input2---text1------false---');

    setValue('contenteditable', 'contenteditable1');
    await expect(getValues()).toEqual('input2---text1---contenteditable1---false---');

    setValue('checkbox', true);
    await expect(getValues()).toEqual('input2---text1---contenteditable1---true---');

    setValue('select', 'volvo');
    await expect(getValues()).toEqual('input2---text1---contenteditable1---true---volvo');

    await expect(canvasElement.querySelector('#count')?.textContent).toEqual('7');
  }
};
