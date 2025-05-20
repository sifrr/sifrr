import type { Meta, StoryObj } from '@storybook/html';
import { expect, userEvent } from '@storybook/test';
import { html, css, ref, bindForKeyed, bindFor } from '@/index';
import currentStyle from './utils/currentStyle.css?inline';
import { rearrange, rearrange2 } from './utils/speedtest.arrangements';

declare global {
  interface Element {
    $: typeof Element.prototype.querySelector;
    $$: typeof Element.prototype.querySelectorAll;
  }

  interface Document {
    $: typeof Document.prototype.querySelector;
    $$: typeof Document.prototype.querySelectorAll;
  }
}

type Args = {
  type: 'keyed' | 'clean' | 'normal';
  useAnimation: boolean;
  useAsync: boolean;
};

const meta: Meta<Args> = {
  title: 'Sifrr/Template/Speed',
  argTypes: {
    type: {
      control: 'select',
      options: ['keyed', 'clean', 'normal']
    },
    useAnimation: {
      type: 'boolean'
    },
    useAsync: {
      type: 'boolean'
    }
  }
};

export default meta;
type Story = StoryObj<Args>;

export const Primary: Story = {
  render: (args) => {
    HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
    HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
    document.$ = document.querySelector;
    document.$$ = document.querySelectorAll;

    const useAnimation = window.location.href.indexOf('useAnim') >= 0 || args.useAnimation;
    const useKey = window.location.href.indexOf('useKey') >= 0 || args.type === 'keyed';
    const useClean = window.location.href.indexOf('useClean') >= 0 || args.type === 'clean';
    const useAsync = window.location.href.indexOf('useAsync') >= 0 || args.useAsync;

    const incss = useAnimation
      ? css`
          tr {
            animation: fade-in 0.4s ease;
          }
          @keyframes fade-in {
            0% {
              opacity: 0;
            }
            100% {
              opacity: 1;
            }
          }
        `
      : () => '';

    let selected: number | null = null;
    const row = html<{
      id: number;
      label: string;
    }>`
      <tr
        class=${({ id }) => (selected == id ? 'danger' : null)}
        :key=${({ id }) => (useKey ? id : null)}
        :data-id=${useAsync ? async ({ id }) => id : ({ id }) => id}
      >
        <td class="col-md-2 id">${useAsync ? async ({ id }) => id : ({ id }) => id}</td>
        <td class="col-md-8">
          <a class="lbl">${useAsync ? async ({ label }) => label : ({ label }) => label}</a>
        </td>
        <td class="col-md-2">
          <a class="remove">X</a>
        </td>
      </tr>
    `;

    const template = html<{ data: { value: any[] } }>`
      <style>
        ${currentStyle} .remove,
        .lbl {
          cursor: pointer;
        }
      </style>
      ${() => incss({})}
      <div class="container" id="main">
        <div class="jumbotron">
          <div class="row">
            <div class="col-md-6">
              <h1>Sifrr</h1>
            </div>
            <div class="col-md-6">
              <div class="row">
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    ::onclick=${() => {
                      setData(buildData(1000));
                    }}
                    id="run"
                  >
                    Create 1,000 rows
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    ::onclick=${() => {
                      setData(buildData(10000));
                    }}
                    id="runlots"
                  >
                    Create 10,000 rows
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    ::onclick=${() => {
                      setData(data.value.concat(buildData(1000)));
                    }}
                    id="add"
                  >
                    Append 1,000 rows
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    ::onclick=${() => {
                      const l = data.value.length;
                      for (let i = 0; i < l; i += 10) {
                        data.value[i].label = data.value[i].label + ' !!!';
                      }
                      setData(data.value);
                    }}
                    id="update"
                  >
                    Update every 10th row
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    ::onclick=${() => {
                      setData([]);
                    }}
                    id="clear"
                  >
                    Clear
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    ::onclick=${() => {
                      if (data.value.length > 998) {
                        const a = data.value[1];
                        data.value[1] = data.value[998];
                        data.value[998] = a;
                        setData(data.value);
                      }
                    }}
                    id="swaprows"
                  >
                    Swap Rows
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    ::onclick=${() => {
                      rearrange(
                        {
                          data: data.value
                        },
                        setData
                      );
                    }}
                    id="swaprows"
                  >
                    Rearrange 50%
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    ::onclick=${() => {
                      rearrange2(
                        {
                          data: data.value
                        },
                        setData
                      );
                    }}
                    id="swaprows"
                  >
                    Rearrange 100%
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <table class="table table-hover table-striped test-data">
          <tbody>
            <!--${({ data = [] }, oldValue) => {
              if (useKey) {
                return bindForKeyed(row, data.value, oldValue);
              } else if (useClean) {
                return data.value.map((d: any, i: number) => row(d, oldValue[i]));
              } else {
                return bindFor(row, data.value, oldValue);
              }
            }}-->
          </tbody>
        </table>
      </div>
    `;

    let from = 1;
    const data = ref<any[]>([]);

    function _random(max: number) {
      return Math.round(Math.random() * 1000) % max;
    }

    const buildData = function (count = 1000, frm = from) {
      const adjectives = [
        'pretty',
        'large',
        'big',
        'small',
        'tall',
        'short',
        'long',
        'handsome',
        'plain',
        'quaint',
        'clean',
        'elegant',
        'easy',
        'angry',
        'crazy',
        'helpful',
        'mushy',
        'odd',
        'unsightly',
        'adorable',
        'important',
        'inexpensive',
        'cheap',
        'expensive',
        'fancy'
      ];

      const colours = [
        'red',
        'yellow',
        'blue',
        'green',
        'pink',
        'brown',
        'purple',
        'brown',
        'white',
        'black',
        'orange'
      ];
      const nouns = [
        'table',
        'chair',
        'house',
        'bbq',
        'desk',
        'car',
        'pony',
        'cookie',
        'sandwich',
        'burger',
        'pizza',
        'mouse',
        'keyboard'
      ];
      const data = [];
      for (let i = 0; i < count; i++)
        data.push({
          id: i + frm,
          key: i + frm,
          label:
            adjectives[_random(adjectives.length)] +
            ' ' +
            colours[_random(colours.length)] +
            ' ' +
            nouns[_random(nouns.length)]
        });
      from = from + count;
      return data;
    };

    const div: any = document.createElement('div');
    div.id = 'main-element';
    const inner = template({ data }, undefined, [data]);
    div.append(...inner);

    function getParent(elem: Node | null) {
      while (elem && elem.nodeName !== 'TR') elem = elem.parentNode;
      return elem;
    }

    const setData = (newData: any) => {
      data.value = newData;
    };

    div.addEventListener('click', (e: any) => {
      const target = e.composedPath()[0];
      const id = (getParent(target as Node) as any)?.dataId;
      if (!id) return;

      if (target.matches('.remove, .remove *')) {
        const todel = data.value.findIndex((d: any) => d.id === id);
        data.value.splice(todel, 1);
        setData(data);
      } else if (target.matches('.lbl, .lbl *')) {
        selected = id;
        inner.update?.({ data });
      }
    });

    return div;
  },
  play: async ({ canvasElement, canvas }) => {
    if (window.location.href.indexOf('speedtest') >= 0) return;

    const table = canvasElement.querySelector('table');
    const run = canvasElement.querySelector('#run')!;
    const runlots = canvasElement.querySelector('#runlots')!;
    const add = canvasElement.querySelector('#add')!;
    const clear = canvasElement.querySelector('#clear')!;
    const swaprows = canvasElement.querySelector('#swaprows')!;

    await userEvent.click(run);
    expect(table?.$$('tr').length).toEqual(1000);

    await userEvent.click(clear);
    expect(table?.$$('tr').length).toEqual(0);

    await userEvent.click(runlots);
    expect(table?.$$('tr').length).toEqual(10000);

    await userEvent.click(add);
    expect(table?.$$('tr').length).toEqual(11000);

    await userEvent.click(clear);
    await userEvent.click(run);
    await userEvent.click(swaprows);
    expect(table?.$$('tr').length).toEqual(1000);
    expect((table?.$$('tr')[1] as any)?.dataId).toEqual(12999);
    expect((table?.$$('tr')[998] as any)?.dataId).toEqual(12002);

    await userEvent.click(swaprows);
    expect((table?.$$('tr')[1] as any)?.dataId).toEqual(12002);
    expect((table?.$$('tr')[998] as any)?.dataId).toEqual(12999);

    await userEvent.click(clear);
  },
  args: {
    type: 'normal',
    useAnimation: false,
    useAsync: false
  }
};
