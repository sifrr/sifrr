const Parser = require('./parser');
const JsonExt = require('../utils/json');
const Loader = require('./loader');

class Element extends window.HTMLElement {
  static get observedAttributes() {
    return ['data-sifrr-state'].concat(this.observedAttrs || []);
  }

  static get template() {
    return Loader.all[this.elementName];
  }

  static get elementName() {
    return this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  constructor() {
    super();
    this._state = Object.assign({}, this.constructor.defaultState, JsonExt.parse(this.dataset.sifrrState), this.state);
    this.attachShadow({
      mode: 'open'
    });
    const me = this, content = this.constructor.template.content.cloneNode(true);
    Parser.createStateMap(this, content);
    me.shadowRoot.appendChild(content);
    this.shadowRoot.addEventListener('change', Parser.twoWayBind);
  }

  connectedCallback() {
    Parser.updateState(this);
  }

  disconnectedCallback() {
    if (this.shadowRoot) this.shadowRoot.removeEventListener('change', Parser.twoWayBind);
    else this.removeEventListener('change', Parser.twoWayBind);
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === 'data-sifrr-state') {
      this.state = JsonExt.parse(newVal);
    }
  }

  get state() {
    return this._state;
  }

  set state(v) {
    Object.assign(this._state, v);
    Parser.updateState(this);
  }

  isSifrr(name = null) {
    if (name) return name == this.constructor.elementName;
    else return true;
  }

  clearState() {
    this._state = {};
    Parser.updateState(this);
  }

  srqs(args) {
    return this.shadowRoot.querySelector(args);
  }

  srqsAll(args) {
    return this.shadowRoot.querySelectorAll(args);
  }
}

module.exports = Element;
