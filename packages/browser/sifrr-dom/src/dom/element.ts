import { content, elName, props, tmp, watchers } from '@/dom/symbols';
import { ISifrrElement, SifrrElementKlass } from './types';
import { SifrrCreateFunction, SifrrProps, SifrrNodesArray, Ref, ref, watch } from '@sifrr/template';

function elementClassFactory(baseClass: typeof HTMLElement) {
  class SifrrElement extends baseClass implements ISifrrElement {
    static [elName]: string;
    static [props]?: Set<string>;
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

    [content]: SifrrNodesArray<SifrrElement>;
    readonly [watchers]: (() => void)[] = [];
    [props]: Record<string, unknown> = {};
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
        throw Error(`No template provided for Element: ${constructor.n}`);
      }
      this.context = this.setup() as ReturnType<this['setup']>;
      this[content] = temp(this);
      if (useShadowRoot) {
        this.attachShadow({
          mode: shadowRootMode
        });
      }
      const propKeys = (this.constructor as SifrrElementKlass<any>)[props];
      propKeys?.forEach((k) => {
        this[props][k] = (this as any)[k];
      });
    }

    setup() {
      return {};
    }

    watch<T>(ref: Ref<T> | (() => T), callback: (newV: T, oldV: T) => void) {
      this[watchers].push(watch(ref, callback));
    }

    ref<T>(v: T, deep?: boolean) {
      const r = ref(v, deep);
      return this.watchStore(r);
    }

    watchStore<T>(ref: Ref<T>): Ref<T> {
      ref.__sifrrWatchers?.add(() => {
        this.update();
      });
      return ref;
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
        } else {
          Object.assign(this, this[props]);
          this[props] = {};
        }
        parent.append(...this[content]);
      }
      this.onConnect();
    }

    disconnectedCallback() {
      this.onDisconnect();
    }

    attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
      this.onAttributeChange(attrName, oldVal, newVal);
    }

    setProps(props: SifrrProps<any>) {
      Object.assign(this, props);
      this.update();
    }

    update() {
      if (!this.isConnected) return;
      this.beforeUpdate();
      this[content].update(this);
      this.onUpdate();
      this[watchers].forEach((w) => w());
      this.dispatchEvent(
        new CustomEvent('update', {
          bubbles: false
        })
      );
    }

    isSifrr(name = null) {
      if (name) return name === (<typeof SifrrElement>this.constructor).elementName;
      else return true;
    }

    emit(type: string, data?: any, options?: EventInit) {
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

    // callbacks
    onConnect() {}
    onDisconnect() {}
    onAttributeChange(_name: string, _oldVal: any, _newVal: any) {}
    onPropChange(_prop: string, _oldVal: any, _newVal: any): void {}
    beforeUpdate() {}
    onUpdate() {}
  }

  return SifrrElement as SifrrElementKlass<SifrrElement>;
}

export default elementClassFactory(window.HTMLElement);
