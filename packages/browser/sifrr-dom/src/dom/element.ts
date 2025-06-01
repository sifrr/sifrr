import { ISifrrElement, SifrrElementKlass } from './types';
import { SifrrCreateFunction, update, SifrrProps, SifrrNodesArray } from '@sifrr/template';

function elementClassFactory(baseClass: typeof HTMLElement): SifrrElementKlass {
  class SifrrElement extends baseClass implements ISifrrElement {
    private static _elName: string;
    static readonly template: SifrrCreateFunction<SifrrElement> | null = null;
    static readonly components: SifrrElementKlass[];

    static extends(htmlElementClass: typeof HTMLElement) {
      return elementClassFactory(htmlElementClass);
    }

    static get elementName() {
      return (
        this._elName ||
        ((this._elName = this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()), this._elName)
      );
    }

    static get n() {
      return this.elementName;
    }

    private readonly __content: SifrrNodesArray<SifrrElement>;
    context: Record<string, any>;

    constructor(useShadowRoot = true, shadowRootMode: ShadowRootMode = 'open') {
      super();
      const constructor = <typeof SifrrElement>this.constructor;
      const temp = constructor.template;
      if (!temp) {
        throw Error(`No template provided for Element = ${constructor.n}`);
      }
      this.context = this.setup();
      this.__content = temp(this);
      if (useShadowRoot) {
        this.attachShadow({
          mode: shadowRootMode
        });
      }
    }

    setup() {
      return {};
    }

    connectedCallback() {
      const parent = this.shadowRoot ?? this;
      if (this.__content.length > 0) {
        if (parent.childNodes.length !== 0) {
          parent.textContent = '';
        }
        parent.append(...this.__content);
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
      update(this.__content, this);
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

  return SifrrElement;
}

export default elementClassFactory(window.HTMLElement);
