const { html, css, update, memo } = Sifrr.Template;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const store = {
  backgrounds: [
    {
      src: './wall1.jpg',
      height: 500,
      width: 500,
      clockPosition: {
        left: 31,
        top: 24,
        height: 312,
        width: 312
      }
    },
    {
      src: './wall2.jpg',
      height: 500,
      width: 500,
      clockPosition: {
        left: 92,
        top: 46,
        height: 316,
        width: 316
      }
    },
    {
      src: './wall3.jpg',
      height: 500,
      width: 500,
      clockPosition: {
        left: 88,
        top: 27,
        height: 323,
        width: 323
      }
    },
    {
      src: './wall4.jpg',
      height: 500,
      width: 500,
      clockPosition: {
        left: 70,
        top: 24,
        height: 364,
        width: 364
      }
    },
    {
      src: './wall5.jpg',
      height: 500,
      width: 500,
      clockPosition: {
        left: 98,
        top: 55,
        height: 308,
        width: 308
      }
    },
    {
      src: './wall7.jpg',
      height: 500,
      width: 500,
      clockPosition: {
        left: 182,
        top: 15,
        height: 296,
        width: 297
      }
    },
    {
      src: './wall8.jpg',
      height: 500,
      width: 500,
      clockPosition: {
        left: 124,
        top: 23,
        height: 339,
        width: 339
      }
    },
    {
      src: './wall9.jpg',
      height: 500,
      width: 500,
      clockPosition: {
        left: 68,
        top: 32,
        height: 291,
        width: 292
      }
    },
    {
      src: './wall10.jpg',
      height: 500,
      width: 500,
      clockPosition: {
        left: 94,
        top: 31,
        height: 291,
        width: 291
      }
    },
    {
      src: './wall11.jpg',
      height: 500,
      width: 500,
      clockPosition: {
        left: 40,
        top: 30,
        height: 303,
        width: 303
      }
    },
    {
      src: './wall12.jpg',
      height: 500,
      width: 500,
      clockPosition: {
        left: 60,
        top: 23,
        height: 265,
        width: 265
      }
    }
  ],
  selectedBg: './wall1.jpg',
  clock: '',
  clockFileName: ''
};

const getSelectedBg = () => store.backgrounds.find((bg) => bg.src === store.selectedBg);
const setSelectedBg = (src) => {
  store.selectedBg = src;
  store.update();
};
const downloadBg = (bg) => {
  setSelectedBg(bg.src);
  window
    .html2canvas(document.querySelector('#container'), {
      scale: 5
    })
    .then((canvas) => {
      store.update();
      const image = canvas.toDataURL('image/jpeg').replace('image/jpeg', 'image/octet-stream');
      window.downloadImage(
        image,
        `${bg.src.split('.')[1].split('/')[1]}_${store.clockFileName.split('.')[0]}.jpg`
      );
    });
};

const main = document.getElementById('main');

const CSS = css`
  body,
  html {
    margin: 0;
    padding: 0;
  }
  * {
    box-sizing: border-box;
    transition: all 0.3s ease-in-out;
  }
  #main {
    padding: 16px;
  }
  .row {
    display: flex;
  }
  button {
    padding: 4px;
  }
`;

const Option = html`
  <option value=${({ value }) => value} selected=${({ selected }) => selected}>
    ${({ label }) => label}
  </option>
`;

const NumInput = html`
  <style>
    .span-b {
      height: 32px;
      width: 32px;
      display: inline-block;
      padding: 8px;
      border: 1px solid black;
      vertical-align: bottom;
      user-select: none;
      cursor: pointer;
    }
    .span-h {
      width: 60px;
      display: inline-block;
    }
    .n-input {
      height: 32px;
      width: 60px;
      vertical-align: bottom;
      text-align: center;
    }
  </style>
  <div ::style=${{ padding: '4px' }}>
    <span class="span-h">${({ name }) => name}</span>
    <span
      class="span-b"
      :onclick=${({ value, name }) =>
        () => {
          value[name] = value[name] - 1;
          store.update();
        }}
      >-</span
    >
    <input
      class="n-input"
      type="number"
      min="0"
      name=${({ name }) => name}
      :value=${({ value, name }) => value[name]}
      :onchange=${({ value, name }) =>
        (e) => {
          value[name] = parseInt(e.target.value);
          store.update();
        }}
    />
    <span
      class="span-b"
      :onclick=${({ value, name }) =>
        () => {
          value[name] = value[name] + 1;
          store.update();
        }}
      >+</span
    >
  </div>
`;

const Temp = html`
  ${CSS}
  <h2>Clock Image Maker</h2>
  <div class="row">
    <div
      id="container"
      :style=${() => {
        const bg = getSelectedBg();
        if (!bg) return {};
        return {
          width: `${bg.width}px`,
          height: `${bg.height}px`,
          position: 'relative'
        };
      }}
    >
      <img
        src=${() => {
          const bg = getSelectedBg();
          return bg.src;
        }}
        ::style=${{
          position: 'absolute',
          zIndex: 1,
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
      <img
        src=${({ clock }) => clock}
        :style=${() => {
          const bg = getSelectedBg();
          if (!bg) return {};
          const cp = bg.clockPosition;
          return {
            position: 'absolute',
            zIndex: 2,
            width: `${cp.width}px`,
            height: `${cp.height}px`,
            left: `${cp.left}px`,
            top: `${cp.top}px`
          };
        }}
      />
    </div>
    <div :style=${memo(() => ({ padding: '16px' }))}>
      <label for="bg-select">Select Background</label>
      <select ::onchange=${(e) => setSelectedBg(e.target.value)}>
        ${({ backgrounds, selectedBg }) =>
          backgrounds.map((bg) =>
            Option({
              label: bg.src,
              value: bg.src,
              selected: selectedBg === bg.src
            })
          )}
      </select>
      <p>${memo(({ clock }) => (clock ? '' : 'Please upload a clock image'), ['clock'])}</p>
      <div>
        <input
          type="file"
          name="clock"
          accept="image/*"
          ::onchange=${(e) => {
            const files = e.target.files;
            if (files && files[0]) {
              var reader = new FileReader();

              reader.onload = function (e) {
                store.clock = e.target.result;
                store.clockFileName = files[0].name;
                store.update();
              };

              reader.readAsDataURL(files[0]);
            }
          }}
        />
      </div>
      <div ::style="${{ padding: '20px 0' }}">
        <div>
          ${() => {
            const selectedBg = getSelectedBg();
            return [
              NumInput({ value: selectedBg.clockPosition, name: 'left' }),
              NumInput({ value: selectedBg.clockPosition, name: 'top' }),
              NumInput({ value: selectedBg.clockPosition, name: 'width' }),
              NumInput({ value: selectedBg.clockPosition, name: 'height' })
            ];
          }}
        </div>
      </div>
      <button
        :style=${memo(({ clock }) => (clock ? {} : { display: 'none' }), ['clock'])}
        ::onclick=${() => {
          downloadBg(getSelectedBg());
        }}
      >
        Download Current Image
      </button>
      <button
        :style=${memo(({ clock }) => (clock ? {} : { display: 'none' }), ['clock'])}
        ::onclick=${async () => {
          for (let i = 0; i < store.backgrounds.length; i++) {
            downloadBg(store.backgrounds[i]);
            await delay(1000);
          }
        }}
      >
        Download All Images
      </button>
    </div>
  </div>
`;

const temp = Temp(store);
store.update = () => update(temp, store);
main.append(...temp);
