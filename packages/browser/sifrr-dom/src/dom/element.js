const { collect, create } = require('./ref');
const creator = require('./creator');
const update = require('./update');
const Loader = require('./loader');
const { trigger } = require('./event');

function elementClassFactory(baseClass) {
  return class extends baseClass {
    static extends(htmlElementClass) {
      return elementClassFactory(htmlElementClass);
    }

    static get observedAttributes() {
      return ['data-sifrr-state'].concat(this.observedAttrs());
    }

    static observedAttrs() {
      return [];
    }

    static get template() {
      return (Loader.all[this.elementName] || { template: false }).template;
    }

    static get ctemp() {
      if (this._ctemp) return this._ctemp;
      this._ctemp = this.template;
      if (this._ctemp) {
        if (this.useShadowRoot && window.ShadyCSS && !window.ShadyCSS.nativeShadow) {
          window.ShadyCSS.prepareTemplate(this._ctemp, this.elementName);
        }
        this.stateMap = create(this._ctemp.content, creator, this.defaultState);
      }
      return this._ctemp;
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
        this._state = Object.assign({}, this.constructor.defaultState, this.state);
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
      if(this.__content) {
        if (this.childNodes.length !== 0) this.textContent = '';
        this.appendChild(this.__content);
        delete this.__content;
      }
      if (!this.hasAttribute('data-sifrr-state')) this.update();
      this.onConnect();
    }

    onConnect() {}

    disconnectedCallback() {
      this.onDisconnect();
    }

    onDisconnect() {}

    attributeChangedCallback(attrName, oldVal, newVal) {
      if (attrName === 'data-sifrr-state') {
        this.state = JSON.parse(newVal);
      }
      this.onAttributeChange(attrName, oldVal, newVal);
    }

    onAttributeChange() {}

    get state() {
      return this._state;
    }

    set state(v) {
      if (this._state !== v) Object.assign(this._state, v);
      this.update();
      this.onStateChange();
    }

    onStateChange() {}

    update() {
      update(this);
      trigger(this, 'update', { detail: { state: this.state } });
      this.onUpdate();
    }

    onUpdate() {}

    isSifrr(name = null) {
      if (name) return name === this.constructor.elementName;
      else return true;
    }

    sifrrClone(state) {
      const clone = this.cloneNode(false);
      clone._state = state;
      return clone;
    }

    clearState() {
      this._state = {};
      this.update();
    }

    $(args, sr = true) {
      if (this.constructor.useShadowRoot && sr) return this.shadowRoot.querySelector(args);
      else return this.querySelector(args);
    }

    $$(args, sr = true) {
      if (this.constructor.useShadowRoot && sr) return this.shadowRoot.querySelectorAll(args);
      else return this.querySelectorAll(args);
    }
  };
}

module.exports = elementClassFactory(window.HTMLElement);
