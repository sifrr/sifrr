import type { Meta, StoryObj } from '@storybook/html';
import { expect, userEvent } from '@storybook/test';
import { html, css, update, bindForKeyed, bindFor } from '@/index';
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

const meta: Meta<{}> = {
  title: 'Sifrr/Template/Speed'
};

export default meta;
type Story = StoryObj<{}>;

export const Primary: Story = {
  render: () => {
    HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
    HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
    document.$ = document.querySelector;
    document.$$ = document.querySelectorAll;

    const useAnimation = window.location.href.indexOf('useAnim') >= 0;
    const useKey = window.location.href.indexOf('useKey') >= 0;
    const useClean = window.location.href.indexOf('useClean') >= 0;
    const useAsync = window.location.href.indexOf('useAsync') >= 0;

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

    const template = html<any>`
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
                    :onclick=${(me) => me.run}
                    id="run"
                  >
                    Create 1,000 rows
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    :onclick=${(me) => me.runlots}
                    id="runlots"
                  >
                    Create 10,000 rows
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    :onclick=${(me) => me.add}
                    id="add"
                  >
                    Append 1,000 rows
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    :onclick=${(me) => me.clickUpdate}
                    id="update"
                  >
                    Update every 10th row
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    :onclick=${(me) => me.clear}
                    id="clear"
                  >
                    Clear
                  </button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button
                    type="button"
                    class="btn btn-primary btn-block"
                    :onclick=${(me) => me.swaprows}
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
                          data: div.data
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
                          data: div.data
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
                return bindForKeyed(row, data, oldValue);
              } else if (useClean) {
                return data.map((d: any, i: number) => row(d, oldValue[i]));
              } else {
                return bindFor(row, data, oldValue);
              }
            }}-->
          </tbody>
        </table>
      </div>
    `;

    let from = 1;

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
    const inner = template(div);
    div.append(...inner);

    function getParent(elem: Node | null) {
      while (elem && elem.nodeName !== 'TR') elem = elem.parentNode;
      return elem;
    }

    const setData = (newData: any) => {
      div.data = newData;
      inner.update?.(div);
    };

    div.addEventListener('click', (e: any) => {
      const target = e.composedPath()[0];
      const id = (getParent(target as Node) as any)?.dataId;
      const { data } = div;
      if (target.matches('.remove, .remove *')) {
        const todel = data.findIndex((d: any) => d.id === id);
        data.splice(todel, 1);
        setData(data);
      } else if (target.matches('.lbl, .lbl *')) {
        selected = id;
        setData(data);
      }
    });

    div.run = () => {
      setData(buildData(1000));
    };

    div.runlots = () => {
      setData(buildData(10000));
    };

    div.add = () => {
      setData(div.data.concat(buildData(1000)));
    };

    div.clickUpdate = () => {
      const { data } = div;
      const l = data.length;
      for (let i = 0; i < l; i += 10) {
        data[i].label = data[i].label + ' !!!';
      }
      setData(data);
    };

    div.clear = () => {
      setData([]);
    };

    div.swaprows = () => {
      const data = div.data;
      if (data.length > 998) {
        const a = data[1];
        data[1] = data[998];
        data[998] = a;
        setData(data);
      }
    };

    setData([]);
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
  }
};
