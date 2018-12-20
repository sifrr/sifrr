const Parser = require('./parser');
const JsonExt = require('../utils/json');
const Loader = require('./loader');
const SimpleElement = require('./simpleelement');

class Element extends window.HTMLElement {
  static get observedAttributes() {
    return ['data-sifrr-state'].concat(this.observedAttrs());
  }

  static observedAttrs() {
    return [];
  }

  static get template() {
    return Loader.all[this.elementName];
  }

  static get stateMap() {
    this._stateMap = this._stateMap || Parser.createStateMap(this.template.content);
    return this._stateMap;
  }

  static get elementName() {
    return this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  constructor() {
    super();
    // this._oldState = {};
    this._state = Object.assign({}, this.constructor.defaultState, JsonExt.parse(this.dataset.sifrrState), this.state);
    const content = this.constructor.template.content.cloneNode(true);
    this._refs = Parser.collectRefs(content, this.constructor.stateMap);
    this.useShadowRoot = this.constructor.template.dataset.noShadowRoot === 'false' ? false : this.constructor.useShadowRoot;
    if (this.useShadowRoot) {
      this.attachShadow({
        mode: 'open'
      });
      this.shadowRoot.appendChild(content);
      this.shadowRoot.addEventListener('change', Parser.twoWayBind);
    } else this.appendChild(content);
  }

  connectedCallback() {
    Parser.updateState(this);
    this.onConnect();
  }

  onConnect() {}

  disconnectedCallback() {
    if (this.useShadowRoot) this.shadowRoot.removeEventListener('change', Parser.twoWayBind);
    else this.removeEventListener('change', Parser.twoWayBind);
    this.onDisconnect();
  }

  onDisconnect() {}

  attributeChangedCallback(attrName, oldVal, newVal) {
    if (attrName === 'data-sifrr-state') {
      this.state = JsonExt.parse(newVal);
    }
    this.onAttributeChange();
  }

  onAttributeChange() {}

  get state() {
    // return JsonExt.deepClone(this._state);
    return this._state;
  }

  set state(v) {
    this._oldState = this.state;
    Object.assign(this._state, v);
    Parser.updateState(this);
  }

  isSifrr(name = null) {
    if (name) return name == this.constructor.elementName;
    else return true;
  }

  clearState() {
    // this._oldState = this.state;
    this._state = {};
    Parser.updateState(this);
  }

  srqs(args) {
    return this.shadowRoot.querySelector(args);
  }

  srqsAll(args) {
    return this.shadowRoot.querySelectorAll(args);
  }

  static addArrayToDom(key, template) {
    this._arrayToDom = this._arrayToDom || {};
    // state of simple element is array item
    this._arrayToDom[key] = SimpleElement(template);
  }

  arrayToDom(key, newState = this.state[key]) {
    this._domL = this._domL || {};
    const oldL = this._domL[key];
    const domArray = [];
    // const oldState = this._oldState[key];
    const newL = newState.length;
    if (!oldL) {
      for (let i = 0; i < newL; i++) {
        const el = this.constructor._arrayToDom[key].sifrrClone(true);
        el.state = newState[i];
        domArray.push(el);
      }
    } else {
      for (let i = 0; i < newL; i++) {
        if (i < oldL) {
          // if (JsonExt.shallowEqual(oldState[i], newState[i])) domArray.push(null);
          // else
          domArray.push({ type: 'stateChange', state: newState[i] });
        } else {
          const el = this.constructor._arrayToDom[key].clone();
          el.state = newState[i];
          domArray.push(el);
        }
      }
    }
    this._domL[key] = newL;
    return domArray;
  }
}

module.exports = Element;
