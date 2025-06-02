import { Element } from '@/index';
import { computed, html, memo } from '@sifrr/template';

const randomColor = () => '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, '0');

export class ExampleElement extends Element {
  static get template() {
    return html<ExampleElement>`
      <style>
        .flex {
          display: flex;
          flex-direction: column;
          gap: 16px;
          color: ${(el: ExampleElement) => el.context.color};
        }
      </style>
      <div class="flex">
        <button @click=${(el: ExampleElement) => () => el.context.d++}>
          Click to increase ${(el: ExampleElement) => el.context.d}
        </button>
        <button
          @click=${(el: ExampleElement) => () => {
            el.context.deep.count++;
          }}
        >
          Click to increase ${(el: ExampleElement) => el.context.deep.count},
          ${(el: ExampleElement) => el.context.dd.value}
        </button>
        <button @click=${(el: ExampleElement) => () => (el.context.hide = !el.context.hide)}>
          ${(el: ExampleElement) => (el.context.hide ? 'Show' : 'Hide')}
        </button>
        <p :if=${(el: ExampleElement) => !el.context.hide}>
          Content only shown when toggle is on, currently:
          ${(el: ExampleElement) => el.context.hide}
        </p>
        <button @click=${(el: ExampleElement) => () => el.changeColor()}>Change color</button>
      </div>
    `;
  }

  setup() {
    console.log('setup');
    const d = 0;
    const deep = {
      count: 0
    };
    const dd = computed(() => deep.count * 2);

    return { d, dd, deep, hide: true, color: randomColor() };
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

class ChildElement extends Element {
  prop!: number;

  static readonly template = html<ChildElement>`<p>${(el: ChildElement) => el.prop}</p>
    <p>${(el: ChildElement) => el.context.double.value}</p>`;

  setup() {
    console.log('setup', this.prop);
    const double = computed(() => {
      return this.prop ? this.prop * 2 : 0;
    });
    this.watch(double, (newv, oldv) => {
      console.log('double changed from ', oldv, 'to ', newv);
    });
    return {
      double
    };
  }
}

export class ParentElement extends Element {
  static readonly components = [ChildElement];

  static readonly template = html<ParentElement>`<button
      @click=${memo((el) => () => el.context.prop++)}
    >
      Count++
    </button>
    <button
      @click=${memo((el) => {
        console.log('I should not be called');
        return () => {
          el.context.hide = !el.context.hide;
        };
      }, [])}
    >
      Toggle
    </button>
    <child-element
      :prop="${(el: ParentElement) => {
        return el.context.prop;
      }}"
    ></child-element>
    <child-element
      :if=${(el: ParentElement) => !el.context.hide}
      :prop=${(el: ParentElement) => el.context.prop * 2}
    /> `;

  setup() {
    return {
      prop: 1,
      hide: false
    };
  }
}

export class ControlledInputs extends Element {
  static readonly template = html` <input
      :value="${(el: ControlledInputs) => el.context.input}"
      @input=${memo(
        (el: ControlledInputs) => (evt: InputEvent, tgt: HTMLInputElement) =>
          (el.context.input = tgt.value)
      )}
    />
    <select
      name="banger"
      :value="${(el: ControlledInputs) => el.context.select}"
      @input=${memo((el: ControlledInputs) => (evt: InputEvent, tgt: HTMLSelectElement) => {
        el.context.select = tgt.value;
      })}
    >
      <option value="a">a</option>
      <option value="b">b</option>
      <option value="c">c</option>
      <option value="d">d</option>
    </select>
    <textarea
      title="some ---${(el: ControlledInputs) => el.context.textarea}---${(el: ControlledInputs) =>
        el.context.textarea}-- now this is cool"
      @input=${memo(
        (el) => (evt: InputEvent, tgt: HTMLTextAreaElement) => (el.context.textarea = tgt.value)
      )}
      :value="${(el: ControlledInputs) => el.context.textarea}"
    ></textarea>
    <div
      contenteditable
      @input=${memo((el) => (evt: InputEvent, tgt: HTMLDivElement) => {
        el.context.elements = tgt.textContent ?? '';
      })}
    >
      ${(el: ControlledInputs) => el.context.elements}
    </div>`;

  setup() {
    return {
      input: 'input',
      select: 'a',
      textarea: `text\narea`,
      elements: '<p>paragraph</p>'
    };
  }

  onUpdate(): void {
    console.log(this.context);
  }
}
