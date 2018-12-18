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
    this.useShadowRoot = this.constructor.template.dataset.noSr ? false : true;
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
  }

  disconnectedCallback() {
    if (this.useShadowRoot) this.shadowRoot.removeEventListener('change', Parser.twoWayBind);
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
    // this._oldState = JsonExt.deepClone(this._state);
    Object.assign(this._state, v);
    Parser.updateState(this);
  }

  isSifrr(name = null) {
    if (name) return name == this.constructor.elementName;
    else return true;
  }

  clearState() {
    // this._oldState = JsonExt.deepClone(this._state);
    this._state = {};
    Parser.updateState(this);
  }

  srqs(args) {
    return this.shadowRoot.querySelector(args);
  }

  srqsAll(args) {
    return this.shadowRoot.querySelectorAll(args);
  }

  // static addArrayToDom(key, fx) {
  //   this._arrayToDom = this._arrayToDom || {};
  //   // function takes simple object (no multi level json)
  //   this._arrayToDom[key] = fx;
  // }
  //
  // static addObjectToDom(key, fx) {
  //   this._objectToDom = this._objectToDom || {};
  //   // function take key, value
  //   this._objectToDom[key] = fx;
  // }
  //
  // arrayToDom(key) {
  //   const oldState = this._oldState[key];
  //   const newState = this._state[key], newL = newState.length;
  //   const domArray = [];
  //   for (let i = 0; i < newL; i++) {
  //     if (!oldState || newState[i] !== oldState[i]) domArray.push(this.constructor._arrayToDom[key].call(this, newState[i]));
  //     else domArray.push(null);
  //   }
  //   return domArray;
  // }
  //
  // objectToDom(key) {
  //   const oldState = this._oldState[key];
  //   const newState = this._state[key];
  //   const domArray = [];
  //   for (let key in newState) {
  //     if (!oldState || newState[key] !== oldState[key]) domArray.push(this.constructor._objectToDom[key].call(this, key, newState[key]));
  //     else domArray.push(null);
  //   }
  //   return domArray;
  // }
}

module.exports = Element;
