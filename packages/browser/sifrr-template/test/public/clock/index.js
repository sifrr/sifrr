const { html, css, update, memo } = Sifrr.Template;

const store = {
  backgrounds: [
    {
      src: './bg1.jpg',
      height: 500,
      width: 500,
      clockPosition: {
        left: 100,
        top: 100,
        height: 100,
        width: 100
      }
    },
    {
      src: './bg2.jpg',
      height: 500,
      width: 500,
      clockPosition: {
        left: 150,
        top: 150,
        height: 70,
        width: 70
      }
    }
  ],
  selectedBg: './bg1.jpg',
  clock: ''
};

const getSelectedBg = () => store.backgrounds.find(bg => bg.src === store.selectedBg);

const main = document.getElementById('main');

const CSS = css`
  body,
  html {
    margin: 0;
    padding: 0;
  }
  #main {
    padding: 16px;
  }
  .row {
    display: flex;
  }
`;

const Option = html`
  <option value=${({ value }) => value} selected=${({ selected }) => selected}
    >${({ label }) => label}</option
  >
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
          backgroundImage: `url(${bg.src})`,
          backgroundSize: 'cover',
          position: 'relative'
        };
      }}
    >
      <img
        src=${({ clock }) => clock}
        :style=${() => {
          const bg = getSelectedBg();
          if (!bg) return {};
          const cp = bg.clockPosition;
          return {
            position: 'absolute',
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
      <select
        ::onchange=${e => {
          store.selectedBg = e.target.value;
          store.update();
        }}
      >
        ${({ backgrounds, selectedBg }) =>
          backgrounds.map(bg =>
            Option({
              label: bg.src,
              value: bg.src,
              selected: selectedBg === bg.src
            })
          )}
      </select>
      <p>${({ image }) => (image ? '' : 'Please upload a clock image')}</p>
      <div>
        <input
          type="file"
          name="clock"
          accept="image/*"
          ::onchange=${e => {
            const files = e.target.files;
            if (files && files[0]) {
              var reader = new FileReader();

              reader.onload = function(e) {
                store.clock = e.target.result;
                store.update();
              };

              reader.readAsDataURL(files[0]);
            }
          }}
        />
      </div>
      <div :style=${memo(() => ({ paddingTop: '20px' }))}>
        <button
          :style=${memo(({ clock }) => (clock ? {} : { display: 'none' }), ['clock'])}
          ::onclick=${() => {
            window
              .html2canvas(document.querySelector('#container'), {
                scale: 6
              })
              .then(canvas => {
                const image = canvas
                  .toDataURL('image/jpeg')
                  .replace('image/jpeg', 'image/octet-stream');
                window.downloadImage(image, 'clock.jpg');
              });
          }}
        >
          Download image
        </button>
      </div>
    </div>
  </div>
`;

const temp = Temp(store);
store.update = () => update(temp, store);
main.append(...temp);
