const Parser = require('./parser');
const JsonExt = require('../utils/json');
const Loader = require('./loader');

class Element extends window.HTMLElement {
  static get observedAttributes() {
    return ['data-sifrr-state'].concat(this.observedAttrs || []);
  }

  static get template() {
    this._template = this._template || new Loader(this.elementName).template;
    return this._template;
  }

  static get elementName() {
    return this.name.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
  }

  constructor() {
    super();
    let me = this;
    this.constructor.template.then((template) => {
      me.attachShadow({
        mode: 'open'
      }).appendChild(template.content.cloneNode(true));
      me.stateMap = Parser.createStateMap(me.shadowRoot);
      me.shadowRoot.addEventListener('change', Parser.twoWayBind);
      Parser.updateState(this);
    });
    this._state = this.constructor.defaultState || {};
    this.tag = this.constructor.elementName;
  }

  connectedCallback() {
    this.state = JsonExt.parse(this.dataset.sifrrState) || {};
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
    this._lastState = Object.assign({}, this.state);
    Object.assign(this._state, v);
    Parser.updateState(this);
  }

  isSifrr(name = null) {
    if (name) return name == this.constructor.elementName;
    else return true;
  }

  clearState() {
    this._lastState = this.state;
    this._state = {};
    Parser.updateState(this);
  }
}

module.exports = Element;
