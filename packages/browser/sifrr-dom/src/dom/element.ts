import { ISifrrElement, SifrrElementKlass } from './types';
import {
  SifrrCreateFunction,
  update,
  SifrrProps,
  SifrrNodesArray,
  Ref,
  ref,
  watch
} from '@sifrr/template';

const elName = Symbol('elName');
const tmp = Symbol('template');
const content = Symbol('content');
const watchers = Symbol('watchers');

function elementClassFactory(baseClass: typeof HTMLElement) {
  class SifrrElement extends baseClass implements ISifrrElement {
    private static [elName]: string;
    private static [tmp]: SifrrCreateFunction<any>;
    static readonly template: SifrrCreateFunction<any>;
    static readonly components?: SifrrElementKlass<any>[];

    static extends(htmlElementClass: typeof HTMLElement) {
      return elementClassFactory(htmlElementClass);
    }

    static get elementName() {
      return (
        this[elName] ?? (this[elName] = this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase())
      );
    }

    static get n() {
      return this.elementName;
    }

    readonly [content]: SifrrNodesArray<SifrrElement>;
    readonly [watchers]: (() => void)[] = [];
    context: ReturnType<this['setup']>;

    constructor({
      useShadowRoot = true,
      shadowRootMode = 'open'
    }: {
      useShadowRoot?: boolean;
      shadowRootMode?: ShadowRootMode;
    } = {}) {
      super();
      const constructor = <typeof SifrrElement>this.constructor;
      const temp = (constructor[tmp] = constructor[tmp] ?? constructor.template);
      if (!temp) {
        throw Error(`No template provided for Element = ${constructor.n}`);
      }
      this.context = this.ref(this.setup(), true).value as ReturnType<this['setup']>;
      this[content] = temp(this);
      if (useShadowRoot) {
        this.attachShadow({
          mode: shadowRootMode
        });
      }
    }

    setup() {
      return {};
    }

    watch<T>(ref: Ref<T> | (() => T), callback: (newV: T, oldV: T) => void) {
      this[watchers].push(watch(ref, callback));
    }

    ref<T>(v: T, deep?: boolean) {
      const r = ref(v, deep);
      r.__sifrrWatchers?.add(() => {
        this.update();
      });
      return r;
    }

    reactive<T extends object>(v: T, deep?: boolean) {
      const r = this.ref(v, deep);
      return r.value;
    }

    connectedCallback() {
      const parent = this.shadowRoot ?? this;
      if (this[content].length > 0) {
        if (parent.childNodes.length !== 0) {
          parent.textContent = '';
        }
        parent.append(...this[content]);
      }
      this.onConnect();
    }

    onConnect() {}

    disconnectedCallback() {
      this.onDisconnect();
    }

    onDisconnect() {}

    attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
      this.onAttributeChange(attrName, oldVal, newVal);
    }

    onAttributeChange(_name: string, _oldVal: any, _newVal: any) {}

    setProps(props: SifrrProps<any>) {
      Object.assign(this, props);
      this.update();
    }

    onPropChange(prop: string, oldVal: any, newVal: any): void {}

    update() {
      if (!this.isConnected) return;
      this.beforeUpdate();
      update(this[content], this);
      this.onUpdate();
      this[watchers].forEach((w) => w());
      this.dispatchEvent(new CustomEvent('update'));
    }

    beforeUpdate() {}
    onUpdate() {}

    isSifrr(name = null) {
      if (name) return name === (<typeof SifrrElement>this.constructor).elementName;
      else return true;
    }

    emit(type: string, data: any, options: EventInit) {
      this.dispatchEvent(
        new CustomEvent(type, {
          detail: data,
          composed: true,
          ...options
        })
      );
    }

    $s(args: string) {
      if (this.shadowRoot) return this.shadowRoot.querySelector(args);
      else return super.querySelector(args);
    }

    $$s(args: string) {
      if (this.shadowRoot) return this.shadowRoot.querySelectorAll(args);
      else return this.querySelectorAll(args);
    }

    // setup helpers
  }

  return SifrrElement as SifrrElementKlass<SifrrElement>;
}

export default elementClassFactory(window.HTMLElement);
