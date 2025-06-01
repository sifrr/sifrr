import { ISifrrElement, SifrrElementKlass } from './types';
import {
  SifrrCreateFunction,
  update,
  SifrrProps,
  SifrrNodesArray,
  Ref,
  ref
} from '@sifrr/template';

const elName = Symbol('elName');
const content = Symbol('content');

function elementClassFactory<T>(baseClass: typeof HTMLElement) {
  class SifrrElement extends baseClass implements ISifrrElement {
    private static [elName]: string;
    static readonly template: SifrrCreateFunction<SifrrElement> | null = null;
    static readonly components: SifrrElementKlass<any>[];

    static extends(htmlElementClass: typeof HTMLElement) {
      return elementClassFactory(htmlElementClass);
    }

    static get elementName() {
      return (
        this[elName] ||
        ((this[elName] = this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()), this[elName])
      );
    }

    static get n() {
      return this.elementName;
    }

    readonly [content]: SifrrNodesArray<SifrrElement>;
    context: Record<string, any>;

    constructor({
      useShadowRoot = true,
      shadowRootMode = 'open'
    }: {
      useShadowRoot?: boolean;
      shadowRootMode?: ShadowRootMode;
    } = {}) {
      super();
      const constructor = <typeof SifrrElement>this.constructor;
      const temp = constructor.template;
      if (!temp) {
        throw Error(`No template provided for Element = ${constructor.n}`);
      }
      this.context = this.ref(this.setup(), true).value;
      this[content] = temp(this);
      this[content].forEach((e) => console.log(e.__tempNum));
      if (useShadowRoot) {
        this.attachShadow({
          mode: shadowRootMode
        });
      }
    }

    setup() {
      return {};
    }

    watch(ref: Ref<any>) {
      ref.__sifrrWatchers?.add(() => {
        this.update();
      });
    }

    ref<T>(v: T, deep?: boolean) {
      const r = ref(v, deep);
      this.watch(r);
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

    onPropChange(prop: string, oldVal: any, newVal: any): void {
      this.update();
    }

    update() {
      if (!this.isConnected) return;
      this.beforeUpdate();
      update(this[content], this);
      this.dispatchEvent(new CustomEvent('update'));
      this.onUpdate();
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
