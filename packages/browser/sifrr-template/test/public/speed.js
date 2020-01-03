const { html, css, update } = Sifrr.Template;

HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
document.$ = document.querySelector;
document.$$ = document.querySelectorAll;

const useAnimation = window.location.href.indexOf('useAnim') >= 0;
const useKey = window.location.href.indexOf('useKey') >= 0;

const incss = useAnimation
  ? css`
      tr {
        animation: slide-up 0.4s ease;
      }
      @keyframes slide-up {
        0% {
          opacity: 0;
          transform: translateY(20px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  : '';

let selected = null;

const row = html`
  <tr class=${({ id }) => (selected == id ? 'danger' : null)} :data-id=${({ id }) => id}>
    <td class="col-md-1 id">
      ${({ id }) => id}
    </td>
    <td class="col-md-4">
      <a class="lbl">${({ label }) => label}</a>
    </td>
    <td class="col-md-1">
      <a class="remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>
    </td>
    <td class="col-md-6"></td>
  </tr>
`;

const template = html`<link href="/css/currentStyle.css" rel="stylesheet">
      ${incss}
      <div class="container" id="main">
        <div class="jumbotron">
          <div class="row">
            <div class="col-md-6">
              <h1>Sifrr</h1>
            </div>
            <div class="col-md-6">
              <div class="row">
                <div class="col-sm-6 smallpad">
                  <button type='button' class='btn btn-primary btn-block' :onclick=${me =>
                    me.run} id='run'>Create 1,000 rows</button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button type='button' class='btn btn-primary btn-block' :onclick=${me =>
                    me.runlots} id='runlots'>Create 10,000 rows</button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button type='button' class='btn btn-primary btn-block' :onclick=${me =>
                    me.add} id='add'>Append 1,000 rows</button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button type='button' class='btn btn-primary btn-block' :onclick=${me =>
                    me.clickUpdate} id='update'>Update every 10th row</button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button type='button' class='btn btn-primary btn-block' :onclick=${me =>
                    me.clear} id='clear'>Clear</button>
                </div>
                <div class="col-sm-6 smallpad">
                  <button type='button' class='btn btn-primary btn-block' :onclick=${me =>
                    me.swaprows} id='swaprows'>Swap Rows</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <table class="table table-hover table-striped test-data">
          <tbody>
            <!--${({ data = [] }, oldValue) => {
              if (useKey) {
                return Sifrr.Template.bindForKeyed(row, data, oldValue);
              } else {
                return Sifrr.Template.bindFor(row, data, oldValue);
              }
              // return data.map(i => row(i));
            }}-->
          </tbody>
        </table>
        <span class='glyphicon glyphicon-remove' aria-hidden='true'>
      </div>`;

window.from = 1;

function _random(max) {
  return Math.round(Math.random() * 1000) % max;
}

window.buildData = function(count = 1000, frm = window.from) {
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
  window.from = window.from + count;
  return data;
};

var div = (window.DIV = document.createElement('div'));
div.id = 'main-element';
const inner = template(div);
div.append(...inner);
document.body.append(div);

function getParent(elem) {
  while (elem && elem.nodeName !== 'TR') elem = elem.parentNode;
  return elem;
}

const setData = (window.setData = newData => {
  div.data = newData;
  update(inner, div);
});

div.addEventListener('click', e => {
  const target = e.composedPath()[0];
  const id = (getParent(target) || {}).dataId;
  const { data } = div,
    l = data.length;
  if (target.matches('.remove, .remove *')) {
    const todel = data.findIndex(d => d.id === id);
    data.splice(todel, 1);
    setData(data);
  } else if (target.matches('.lbl, .lbl *')) {
    selected = id;
    setData(data);
  }
});

div.run = () => {
  setData(window.buildData(1000));
};

div.runlots = () => {
  setData(window.buildData(10000));
};

div.add = () => {
  setData(div.data.concat(window.buildData(1000)));
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
