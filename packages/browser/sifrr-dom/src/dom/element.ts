import { ISifrrElement, SifrrElementKlass } from './types';
import { SifrrCreateFunction, SifrrNode, update, SifrrProps } from '@sifrr/template';
import { trigger } from './event';

function elementClassFactory(baseClass: typeof HTMLElement): SifrrElementKlass {
  return class SifrrElement extends baseClass implements ISifrrElement {
    private static _elName: string;
    static readonly template: SifrrCreateFunction<SifrrElement> = null;
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

    private __content: SifrrNode<SifrrElement>[] = [];
    public state: object;

    constructor(useShadowRoot = true, shadowRootMode: ShadowRootMode = 'open') {
      super();
      if (useShadowRoot) {
        this.attachShadow({
          mode: shadowRootMode
        });
      }
    }

    connectedCallback() {
      const constructor = <typeof SifrrElement>this.constructor;
      const temp = constructor.template;
      this.__content = this.__content || temp(this);
      const parent = this.shadowRoot ?? this;
      if (this.__content.length > 0) {
        if (this.childNodes.length !== 0) {
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
      trigger(this, 'update', { detail: { state: this.state } });
      this.onUpdate();
    }

    beforeUpdate() {}
    onUpdate() {}

    isSifrr(name = null) {
      if (name) return name === (<typeof SifrrElement>this.constructor).elementName;
      else return true;
    }

    clearState() {
      this.state = {};
      this.update();
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

    $(args: string) {
      if (this.shadowRoot) return this.shadowRoot.querySelector(args);
      else return this.querySelector(args);
    }

    $$(args: string) {
      if (this.shadowRoot) return this.shadowRoot.querySelectorAll(args);
      else return this.querySelectorAll(args);
    }
  };
}

export default elementClassFactory(window.HTMLElement);
