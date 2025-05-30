import { html, memo } from '@/index';
import type { Meta, StoryObj } from '@storybook/html';
import { expect } from '@storybook/test';

const meta: Meta<{}> = {
  title: 'Sifrr/Template/Memo'
};

export default meta;
type Story = StoryObj<{}>;

export const Primary: Story = {
  render: () => {
    let i = 0,
      j = 0,
      k = 0,
      l = 0;
    const El = html`
      <div
        id="memo0"
        ::onclick=${() => {
          setProps({});
        }}
      >
        ${memo(() => i++, [])}
      </div>
      <div
        id="memo1"
        ::onclick=${() => {
          setProps({ text: elProps.text + elProps.text });
        }}
      >
        ${memo(() => j++, ['text'])}
      </div>
      <div
        id="memoobj"
        ::onclick=${() => {
          setProps({ object: { ...elProps.object } });
        }}
      >
        ${memo(() => k++, ['object'])}
      </div>
      <div
        id="memomulti"
        ::onclick=${() => {
          setProps({ text1: elProps.text1 + elProps.text1 });
        }}
      >
        ${memo(() => l++, ['text', 'text1'])}
      </div>
      <p>${(props) => JSON.stringify(props)}</p>
    `;
    const elProps = { text: 'a', text1: 'b', object: {} };
    const st = El(elProps);
    const setProps = (props = {}) => {
      return st.update?.(Object.assign(elProps, props));
    };

    const div = document.createElement('div');
    div.id = 'memo';
    (div as any).setProps = setProps;
    (div as any).getProps = () => elProps;

    div.append(...st);

    return div;
  },
  play: async ({ canvasElement }) => {
    const memo0 = canvasElement.querySelector('#memo0')!;
    const text = canvasElement.querySelector('#memo1')!;
    const obj = canvasElement.querySelector('#memoobj')!;
    const text1 = canvasElement.querySelector('#memomulti')!;

    function getValues(name: string): number {
      return {
        memo0: parseInt(memo0.textContent ?? '0'),
        memo1: parseInt(text.textContent ?? '0'),
        memoobj: parseInt(obj.textContent ?? '0'),
        memomulti: parseInt(text1.textContent ?? '0')
      }[name] as number;
    }

    const setProps = (document.querySelector('#memo') as any)?.setProps;
    const getProps = (document.querySelector('#memo') as any)?.getProps;

    // memo0
    const valuesStart = getValues('memo0');
    await setProps({ text: 'aa', text1: 'bb' });
    await setProps({ object: {} });
    expect(valuesStart).toEqual(getValues('memo0'));

    // memo1
    const startMemo1 = getValues('memo1');
    await setProps({ text: 'sfsdf' });
    expect(startMemo1 + 1).toEqual(getValues('memo1'));
    await setProps({ object: {} });
    expect(startMemo1 + 1).toEqual(getValues('memo1'));
    await setProps({ text: 'sfsdf' });
    expect(startMemo1 + 1).toEqual(getValues('memo1'));
    await setProps({ text1: 'b' });
    expect(startMemo1 + 1).toEqual(getValues('memo1'));
    await setProps({ text: 'sgkll' });
    expect(startMemo1 + 2).toEqual(getValues('memo1'));

    // memoobj
    const startObj = getValues('memoobj');
    await setProps({ object: {} });
    expect(startObj + 1).toEqual(getValues('memoobj'));
    await setProps({ text: 'sfsdf' });
    expect(startObj + 1).toEqual(getValues('memoobj'));
    await setProps({ text1: 'b' });
    expect(startObj + 1).toEqual(getValues('memoobj'));
    await setProps({ object: {} });
    expect(startObj + 2).toEqual(getValues('memoobj'));
    await setProps({ object: getProps().object });
    expect(startObj + 2).toEqual(getValues('memoobj'));

    // memomulti
    const startMulti = getValues('memomulti');
    await setProps({ object: {} });
    expect(startMulti).toEqual(getValues('memomulti'));
    await setProps({ text: 'aasdf' });
    expect(startMulti + 1).toEqual(getValues('memomulti'));
    await setProps({ text1: 'bghhhg' });
    expect(startMulti + 2).toEqual(getValues('memomulti'));
    await setProps({ object: {} });
    expect(startMulti + 2).toEqual(getValues('memomulti'));
    await setProps({ text1: 'dsgdfh;', text: 'sdghh' });
    expect(startMulti + 3).toEqual(getValues('memomulti'));
  }
};
