import { Element } from '@/index';
import { html } from '@sifrr/template';

const randomColor = () => '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, '0');

export class ExampleElement extends Element {
  static get template() {
    return html`
      <style>
        .flex {
          display: flex;
          flex-direction: column;
          gap: 16px;
          color: ${(el) => el.context.color};
        }
      </style>
      <div class="flex">
        <button @click=${(el) => () => el.context.d++}>
          Click to increase ${(el) => el.context.d}
        </button>
        <button
          @click=${(el) => () => {
            el.context.deep.count++;
          }}
        >
          Click to increase ${(el) => el.context.deep.count}
        </button>
        <button @click=${(el) => () => (el.context.hide = !el.context.hide)}>
          ${(el) => (el.context.hide ? 'Show' : 'Hide')}
        </button>
        <p :if=${(el) => !el.context.hide}>Content only shown when toggle is on</p>
        <button @click=${(el) => () => el.changeColor()}>Change color</button>
      </div>
    `;
  }

  setup() {
    console.log('setup');
    const d = 0;
    const deep = {
      count: 0
    };

    return { d, deep, hide: true, color: randomColor() };
  }

  changeColor() {
    this.context.color = randomColor();
  }

  onConnect(): void {
    console.log('connect');
  }

  onUpdate(): void {
    console.log('update');
  }
}
