const Vdom = require('./vdom');
const JsonExt = require('../utils/json');
const fetch = require('@sifrr/fetch');

class Element extends window.HTMLElement {
  static get observedAttributes() {
    return ['data-sifrr-state'].concat(this.observedAttrs || []);
  }

  static get templateUrl() {
    return `/elements/${this.elementName.split('-').join('/')}.html`;
  }

  static get elementName() {
    return this.name.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
  }

  static get template() {
    this._template = this._template || this.getTemplate();
    return this._template;
  }

  static getTemplate() {
    return fetch.file(this.templateUrl);
  }

  constructor() {
    super();
    let me = this;
    this.constructor.template.then((template) => {
      me.attachShadow({
        mode: 'open'
      }).appendChild(template.content.cloneNode(true));
      me.vdom = Vdom.toVDOM(template.content.cloneNode(true));
    });
    this._state = this.constructor.defaultState || {};
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === 'data-sifrr-state') {
      this.state = JsonExt.parse(newVal);
    }
  }

  connectedCallback() {
    this.state = JsonExt.parse(this.dataset.sifrrState) || {};
    if (this.shadowRoot) this.shadowRoot.addEventListener('change', Vdom.twoWayBind);
    else this.addEventListener('change', Vdom.twoWayBind);
  }

  disconnectedCallback() {}

  get state() {
    return this._state || {};
  }

  set state(v) {
    this._lastState = this.state;
    Object.assign(this._state, v);
    Vdom.updateState(this);
  }

  isSifrr(name = null) {
    if (name) return name == this.constructor.elementName;
    else return true;
  }

  clearState() {
    this._lastState = this.state;
    this._state = {};
    Vdom.updateState(this);
  }
}

module.exports = Element;
