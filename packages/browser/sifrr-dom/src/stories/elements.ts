import { Component, Prop } from '@/dom/decorator';
import { Element } from '@/index';
import { cls, computed, html, memo, SifrrCreateFunction } from '@sifrr/template';

const randomColor = () => '#' + (((1 << 24) * Math.random()) | 0).toString(16).padStart(6, '0');

export class FlexElement extends Element {
  flexDirection?: 'column' | 'row';
  gap?: 0;

  static readonly template: SifrrCreateFunction<FlexElement> = html`
    <style>
      .flex {
        display: flex;
        flex-direction: ${(el: FlexElement) => el.flexDirection ?? 'column'};
        gap: ${(el: FlexElement) => (el.gap ?? 0) + 'px'};
      }
    </style>
    <div class="flex">
      <slot />
    </div>
  `;
}

export class ExampleElement extends Element {
  static readonly flexCls = cls();

  static get template() {
    return html<ExampleElement>`
      <style>
        .${ExampleElement.n}.${ExampleElement.flexCls} {
          display: flex;
          flex-direction: column;
          gap: 16px;
          color: ${(el: ExampleElement) => {
            return el.context.color.value;
          }};
        }
      </style>
      <div
        class="${ExampleElement.n} ${ExampleElement.flexCls}"
        style="position: static"
        :style=${(el: ExampleElement) => el.context.style.value}
      >
        <button
          @click=${(el: ExampleElement) => () => {
            return el.context.d.value++;
          }}
        >
          Click to increase ${(el: ExampleElement) => el.context.d.value}
        </button>
        <button
          @click=${(el: ExampleElement) => () => {
            el.context.deep.count++;
          }}
        >
          Click to increase ${(el: ExampleElement) => el.context.deep.count},
          ${(el: ExampleElement) => el.context.dd.value}
        </button>
        <button
          @click=${(el: ExampleElement) => () => (el.context.hide.value = !el.context.hide.value)}
        >
          ${(el: ExampleElement) => (el.context.hide.value ? 'Show' : 'Hide')}
        </button>
        <p :if=${(el: ExampleElement) => !el.context.hide.value}>
          Content only shown when toggle is on, currently:
          ${(el: ExampleElement) => el.context.hide.value}
        </p>
        <button @click=${(el: ExampleElement) => () => el.changeColor()}>Change color</button>
        <button @click=${(el: ExampleElement) => () => el.context.gap.value++}>Increase gap</button>
      </div>
    `;
  }

  constructor() {
    super();
  }

  setup() {
    const d = this.ref(0);
    const deep = this.reactive({
      count: 0
    });
    const dd = computed(() => deep.count * 2);
    const gap = this.ref(12);

    return {
      d,
      dd,
      deep,
      hide: this.ref(true),
      color: this.ref(randomColor()),
      gap,
      style: computed(() => ({
        display: 'flex',
        gap: gap.value + 'px'
      }))
    };
  }

  changeColor() {
    this.context.color.value = randomColor();
  }

  onConnect(): void {
    console.log('connect');
  }

  onUpdate(): void {
    console.log('update');
  }

  onDisconnect(): void {
    console.log('disconnect');
  }
}

@Component({
  tag: 'child-element'
})
class ChildElement extends Element {
  @Prop()
  prop!: number;

  static readonly template = html<ChildElement>`<p>${(el: ChildElement) => el.prop}</p>
    <p>${(el: ChildElement) => el.context.double.value}</p>
    <button
      @click=${(el: ChildElement) => () =>
        el.emit('finish', [el, el.prop, el.context.double.value])}
    >
      Finish
    </button> `;

  setup() {
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

  onConnect(): void {
    console.log('connect child');
  }
}

export class ParentElement extends Element {
  static readonly dependencies = [ChildElement];

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
      @finish=${() => (e: CustomEvent) => console.log(e.type, e.detail)}
      :prop="${(el: ParentElement) => {
        return el.context.prop;
      }}"
    ></child-element>
    <child-element
      @finish=${() => (e: CustomEvent) => console.log(e.type, e.detail)}
      :if=${(el: ParentElement) => !el.context.hide}
      :prop=${(el: ParentElement) => el.context.prop * 2}
    /> `;

  setup() {
    return this.reactive({
      prop: 1,
      hide: false
    });
  }

  onConnect(): void {
    console.log('connect parent');
  }
}

export class ControlledInputs extends Element {
  static readonly dependencies = [FlexElement];

  static readonly template = html` <flex-element :gap="12">
    <input
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
        el.context.textarea}--- where"
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
    </div>
    <p>${(el: ControlledInputs) => JSON.stringify(el.context, null, 2)}</p>
  </flex-element>`;

  setup() {
    return this.reactive({
      input: 'input',
      select: 'a',
      textarea: `text\narea`,
      elements: '<p>paragraph</p>'
    });
  }

  onUpdate(): void {
    console.log(this.context);
  }
}
