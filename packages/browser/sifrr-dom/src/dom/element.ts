import { ISifrrElement } from './types';
import { SifrrCreateFunction, SifrrNode, update } from '@sifrr/template';
import { trigger } from './event';

function elementClassFactory(baseClass: typeof HTMLElement) {
  return class SifrrElement extends baseClass implements ISifrrElement {
    private static _ctemp: SifrrCreateFunction<SifrrElement>;
    static useShadowRoot: boolean = true;
    static template: SifrrCreateFunction<SifrrElement> = null;
    static defaultState: object = null;

    static extends(htmlElementClass: typeof HTMLElement) {
      return elementClassFactory(htmlElementClass);
    }

    static get elementName() {
      return this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    static ctemp() {
      if (this._ctemp) return this._ctemp;

      this._ctemp = this.template;
      return this._ctemp;
    }

    private __content: SifrrNode<SifrrElement>[];
    public connected: boolean = false;
    public state: object;

    constructor() {
      super();
      const constructor = <typeof SifrrElement>this.constructor;
      const temp = constructor.ctemp();
      if (temp) {
        this.__content = temp(null);
        if (constructor.useShadowRoot) {
          this.attachShadow({
            mode: 'open'
          });
          this.shadowRoot.append(...this.__content);
        }
      }
    }

    connectedCallback() {
      this.connected = true;
      if (!this.shadowRoot) {
        if (this.childNodes.length !== 0) this.textContent = '';
        this.append(...this.__content);
      }
      this.update();
      this.onConnect();
    }

    onConnect() {}

    disconnectedCallback() {
      this.connected = false;
      this.onDisconnect();
    }

    onDisconnect() {}

    attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {
      this.onAttributeChange(attrName, oldVal, newVal);
    }

    onAttributeChange(_name: string, _oldVal: any, _newVal: any) {}

    onPropChange(prop: string, oldVal: any, newVal: any): void {}

    setState(v: any) {
      if (this.state !== v) this.state = Object.assign({}, this.state, v);
      this.update();
      this.onStateChange();
    }

    onStateChange() {}

    update() {
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

    sifrrClone(state: object) {
      const clone = <SifrrElement>this.cloneNode(false);
      clone.state = state;
      return clone;
    }

    clearState() {
      this.state = {};
      this.update();
    }

    $(args: string, sr = true) {
      if (this.shadowRoot && sr) return this.shadowRoot.querySelector(args);
      else return this.querySelector(args);
    }

    $$(args: string, sr = true) {
      if (this.shadowRoot && sr) return this.shadowRoot.querySelectorAll(args);
      else return this.querySelectorAll(args);
    }
  };
}

export default elementClassFactory(window.HTMLElement);
