import { collect, create } from './ref';
import creator from './creator';
import update from './update';
import Loader from './loader';
import { trigger } from './event';
import template from './template';
import { BIND_PROP } from './constants';

function elementClassFactory(baseClass) {
  return class extends baseClass {
    static extends(htmlElementClass) {
      return elementClassFactory(htmlElementClass);
    }

    static get observedAttributes() {
      return this.observedAttrs();
    }
    static observedAttrs() {
      return [];
    }

    static get template() {
      return (Loader.all[this.elementName] || { template: false }).template;
    }

    static get ctemp() {
      if (this._ctemp) return this._ctemp;
      if (this.template) {
        this._ctemp = template(this.template);
        if (this.useShadowRoot && window.ShadyCSS && !window.ShadyCSS.nativeShadow) {
          window.ShadyCSS.prepareTemplate(this._ctemp, this.elementName);
        }
        this.stateMap = create(this._ctemp.content, creator, this.defaultState);
      }
      return this._ctemp || false;
    }

    static get elementName() {
      return this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    static get useShadowRoot() {
      return this.useSR;
    }

    constructor() {
      super();
      if (this.constructor.ctemp) {
        this.state = Object.assign({}, this.constructor.defaultState, this.state);
        const content = this.constructor.ctemp.content.cloneNode(true);
        this._refs = collect(content, this.constructor.stateMap);
        if (this.constructor.useShadowRoot) {
          this.attachShadow({
            mode: 'open'
          });
          this.shadowRoot.appendChild(content);
        } else {
          this.__content = content;
        }
      }
    }

    connectedCallback() {
      this.connected = true;
      this._root = undefined;
      if (this.__content) {
        if (this.childNodes.length !== 0) this.textContent = '';
        this.appendChild(this.__content);
        delete this.__content;
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

    attributeChangedCallback(attrName, oldVal, newVal) {
      this.onAttributeChange(attrName, oldVal, newVal);
    }

    onAttributeChange() {}

    setState(v) {
      if (!this.state) return;
      if (this.state !== v) Object.assign(this.state, v);
      this.update();
      this.onStateChange();
    }

    onStateChange() {}

    update() {
      this.beforeUpdate();
      update(this);
      if (this._update || this.triggerUpdate || this[BIND_PROP]) {
        trigger(this, 'update', { detail: { state: this.state } });
      }
      this.onUpdate();
    }

    beforeUpdate() {}
    onUpdate() {}

    isSifrr(name = null) {
      if (name) return name === this.constructor.elementName;
      else return true;
    }

    sifrrClone(state) {
      const clone = this.cloneNode(false);
      clone.state = state;
      return clone;
    }

    clearState() {
      this.state = {};
      this.update();
    }

    $(args, sr = true) {
      if (this.shadowRoot && sr) return this.shadowRoot.querySelector(args);
      else return this.querySelector(args);
    }

    $$(args, sr = true) {
      if (this.shadowRoot && sr) return this.shadowRoot.querySelectorAll(args);
      else return this.querySelectorAll(args);
    }

    get root() {
      if (!this._root) {
        let root = this.parentNode;
        while (root && !root.isSifrr) root = root.parentNode || root.host;
        if (root && root.isSifrr) this._root = root;
      }
      return this._root;
    }
  };
}

export default elementClassFactory(window.HTMLElement);
