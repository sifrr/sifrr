/*! Sifrr.Dom v0.0.2-alpha - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@sifrr/fetch')) :
  typeof define === 'function' && define.amd ? define(['@sifrr/fetch'], factory) :
  (global = global || self, (global.Sifrr = global.Sifrr || {}, global.Sifrr.Dom = factory(global.Sifrr.Fetch)));
}(this, function (fetch) { 'use strict';

  fetch = fetch && fetch.hasOwnProperty('default') ? fetch['default'] : fetch;

  const TREE_WALKER = window.document.createTreeWalker(window.document, window.NodeFilter.SHOW_ALL, null, false);
  TREE_WALKER.nextNonfilterNode = function (fxn) {
    let node = this.currentNode;
    if (fxn && fxn(node)) {
      node = this.nextSibling() || (this.parentNode(), this.nextSibling());
    } else node = this.nextNode();
    return node;
  };
  TREE_WALKER.roll = function (n, filter) {
    let node = this.currentNode;
    while (--n) {
      node = this.nextNonfilterNode(filter);
    }
    return node;
  };
  class Ref {
    constructor(idx, ref) {
      this.idx = idx;
      this.ref = ref;
    }
  }
  function collect(element, stateMap, filter = false) {
    const refs = [],
          l = stateMap.length;
    TREE_WALKER.currentNode = element;
    for (let i = 0; i < l; i++) {
      refs.push(TREE_WALKER.roll(stateMap[i].idx, filter));
    }
    return refs;
  }
  function create(node, fxn, filter = false) {
    let indices = [],
        ref,
        idx = 0;
    TREE_WALKER.currentNode = node;
    while (node) {
      if (ref = fxn(node, filter)) {
        indices.push(new Ref(idx + 1, ref));
        idx = 1;
      } else {
        idx++;
      }
      node = TREE_WALKER.nextNonfilterNode(filter);
    }
    return indices;
  }
  var ref = {
    collect,
    create,
    Ref
  };

  const temp = window.document.createElement('template');
  const script = window.document.createElement('script');
  const reg = '(\\${(?:(?:[^{}$]|{(?:[^{}$])*})*)})';
  var constants = {
    TEMPLATE: () => temp.cloneNode(false),
    SCRIPT: () => script.cloneNode(false),
    TEXT_NODE: 3,
    COMMENT_NODE: 8,
    ELEMENT_NODE: 1,
    OUTER_REGEX: new RegExp(reg, 'g')
  };

  const {
    OUTER_REGEX
  } = constants;
  function replacer(match) {
    let f;
    if (match.indexOf('return ') >= 0) {
      f = match;
    } else {
      f = 'return ' + match;
    }
    try {
      return new Function(f);
    } catch (e) {
      window.console.log(`Error processing binding: \`${f}\``);
      return '';
    }
  }
  function evaluate(fxn, el) {
    try {
      if (typeof fxn === 'string') return fxn;else return fxn.call(el) || '';
    } catch (e) {
      const str = fxn.toString();
      window.console.log(`Error evaluating: \`${str.slice(str.indexOf('{') + 1, str.lastIndexOf('}'))}\` for element`, el);
      window.console.error(e);
    }
  }
  var bindings = {
    getBindingFxns: string => {
      const splitted = string.split(OUTER_REGEX),
            l = splitted.length,
            ret = [];
      for (let i = 0; i < l; i++) {
        if (splitted[i][0] === '$' && splitted[i][1] === '{') {
          ret.push(replacer(splitted[i].slice(2, -1)));
        } else if (splitted[i]) ret.push(splitted[i]);
      }
      return ret;
    },
    evaluateBindings: (fxns, element) => {
      if (fxns.length === 1) {
        return evaluate(fxns[0], element);
      }
      return fxns.map(fxn => evaluate(fxn, element)).join('');
    },
    evaluate: evaluate,
    replacer: replacer
  };

  const {
    TEXT_NODE,
    COMMENT_NODE,
    ELEMENT_NODE
  } = constants;
  const {
    getBindingFxns
  } = bindings;
  function simpleElementCreator(node) {
    if (node.nodeType === ELEMENT_NODE) {
      const attrs = Array.prototype.slice.call(node.attributes),
            l = attrs.length;
      const ret = [];
      for (let i = 0; i < l; i++) {
        const avalue = attrs[i].value;
        if (avalue[0] === '$') {
          ret.push({
            name: attrs[i].name,
            text: avalue.slice(2, -1)
          });
          node.setAttribute(attrs[i].name, '');
        }
      }
      if (ret.length > 0) return ret;
      return 0;
    } else {
      let nodeData = node.data;
      if (nodeData[0] === '$') {
        node.data = '';
        return nodeData.slice(2, -1);
      }
      return 0;
    }
  }
  function customElementCreator(el, filter) {
    if (el.nodeType === TEXT_NODE || el.nodeType === COMMENT_NODE) {
      const x = el.data;
      if (x.indexOf('${') > -1) return {
        html: false,
        text: getBindingFxns(x.trim())
      };
    } else if (el.nodeType === ELEMENT_NODE) {
      const sm = {};
      if (filter(el)) {
        const innerHTML = el.innerHTML;
        if (innerHTML.indexOf('${') >= 0) {
          sm.html = true;
          sm.text = getBindingFxns(innerHTML.replace(/<!--((?:(?!-->).)+)-->/g, '$1').trim());
        }
      }
      const attrs = el.attributes,
            l = attrs.length;
      const attrStateMap = {
        events: {}
      };
      for (let i = 0; i < l; i++) {
        const attribute = attrs[i];
        if (attribute.name[0] === '_') {
          attrStateMap.events[attribute.name] = getBindingFxns(attribute.value);
        } else if (attribute.value.indexOf('${') >= 0) {
          attrStateMap[attribute.name] = getBindingFxns(attribute.value);
        }
      }
      if (Object.keys(attrStateMap.events).length === 0) delete attrStateMap.events;
      if (Object.keys(attrStateMap).length > 0) sm.attributes = attrStateMap;
      if (Object.keys(sm).length > 0) return sm;
    }
    return 0;
  }
  var creator = {
    creator: customElementCreator,
    simpleCreator: simpleElementCreator
  };

  const {
    collect: collect$1,
    create: create$1
  } = ref;
  const {
    creator: creator$1
  } = creator;
  function isHtml(el) {
    return el.dataset && el.dataset.sifrrHtml == 'true' || el.dataset && el.dataset.sifrrRepeat;
  }
  const Parser = {
    collectRefs: (el, stateMap) => collect$1(el, stateMap, isHtml),
    createStateMap: element => create$1(element, creator$1, isHtml),
    twoWayBind: e => {
      const target = e.composedPath ? e.composedPath()[0] : e.target;
      if (!target.dataset.sifrrBind || target._root === null) return;
      const value = target.value || target.textContent;
      let state = {};
      if (!target._root) {
        let root;
        root = target;
        while (root && !root.isSifrr) root = root.parentNode || root.host;
        if (root) target._root = root;else target._root = null;
      }
      state[target.dataset.sifrrBind] = value;
      if (target._root) target._root.state = state;
    }
  };
  var parser = Parser;

  var updateattribute = (element, name, newValue) => {
    const fromValue = element.getAttribute(name);
    if (fromValue != newValue) {
      if (name === 'class') element.className = newValue;else element.setAttribute(name, newValue);
    }
    if (name == 'value' && (element.nodeName == 'SELECT' || element.nodeName == 'INPUT')) element.value = newValue;
  };

  const Json = {
    shallowEqual: (a, b) => {
      for (let key in a) {
        if (!(key in b) || a[key] !== b[key]) {
          return false;
        }
      }
      for (let key in b) {
        if (!(key in a) || a[key] !== b[key]) {
          return false;
        }
      }
      return true;
    }
  };
  var json = Json;

  const {
    shallowEqual
  } = json;
  const {
    TEXT_NODE: TEXT_NODE$1,
    COMMENT_NODE: COMMENT_NODE$1
  } = constants;
  function makeChildrenEqual(parent, newChildren) {
    const oldL = parent.childNodes.length,
          newL = newChildren.length;
    if (oldL > newL) {
      let i = oldL;
      while (i > newL) {
        parent.removeChild(parent.lastChild);
        i--;
      }
    } else if (oldL < newL) {
      let i = oldL;
      while (i < newL) {
        parent.appendChild(newChildren[i]);
        i++;
      }
    }
    const l = Math.min(newL, oldL);
    for (let i = 0, item, head = parent.firstChild; i < l; i++) {
      item = newChildren[i];
      head = makeEqual(head, item).nextSibling;
    }
  }
  function makeEqual(oldNode, newNode) {
    if (newNode.type === 'stateChange') {
      if (!shallowEqual(oldNode.state, newNode.state)) {
        oldNode.state = newNode.state;
      }
      return oldNode;
    }
    if (oldNode.nodeName !== newNode.nodeName) {
      oldNode.replaceWith(newNode);
      return newNode;
    }
    if (oldNode.nodeType === TEXT_NODE$1 || oldNode.nodeType === COMMENT_NODE$1) {
      if (oldNode.data !== newNode.data) oldNode.data = newNode.data;
      return oldNode;
    }
    if (newNode.state) oldNode.state = newNode.state;
    let oldAttrs = oldNode.attributes,
        newAttrs = newNode.attributes,
        attr;
    for (let i = newAttrs.length - 1; i >= 0; --i) {
      updateattribute(oldNode, newAttrs[i].name, newAttrs[i].value);
    }
    for (let j = oldAttrs.length - 1; j >= 0; --j) {
      attr = oldAttrs[j];
      if (!newNode.hasAttribute(attr.name)) oldNode.removeAttribute(attr.name);
    }
    makeChildrenEqual(oldNode, Array.prototype.slice.call(newNode.childNodes));
    return oldNode;
  }
  var makeequal = {
    makeEqual,
    makeChildrenEqual
  };

  const {
    makeChildrenEqual: makeChildrenEqual$1
  } = makeequal;
  const {
    evaluateBindings
  } = bindings;
  const TEMPLATE = constants.TEMPLATE();
  function simpleElementUpdate(simpleEl) {
    const doms = simpleEl._refs,
          refs = simpleEl.stateMap,
          l = refs.length;
    for (let i = 0; i < l; i++) {
      const data = refs[i].ref,
            dom = doms[i];
      if (Array.isArray(data)) {
        const l = data.length;
        for (let i = 0; i < l; i++) {
          const attr = data[i];
          if (attr.name === 'class') dom.className = simpleEl.state[attr.text];else dom.setAttribute(attr.name, simpleEl.state[attr.text]);
        }
      } else {
        dom.data = simpleEl.state[data];
      }
    }
  }
  function customElementUpdate(element) {
    if (!element._refs) {
      return false;
    }
    const l = element._refs.length;
    for (let i = 0; i < l; i++) {
      const data = element.constructor.stateMap[i].ref;
      const dom = element._refs[i];
      if (data.attributes) {
        for (let key in data.attributes) {
          if (key === 'events') {
            for (let event in data.attributes.events) {
              const eventLis = evaluateBindings(data.attributes.events[event], element);
              dom[event] = eventLis;
            }
            dom._root = element;
            delete data.attributes['events'];
          } else {
            const val = evaluateBindings(data.attributes[key], element);
            updateattribute(dom, key, val);
          }
        }
      }
      if (data.html === undefined) continue;
      const newValue = evaluateBindings(data.text, element);
      if (data.html) {
        let children;
        if (Array.isArray(newValue)) {
          children = newValue;
        } else if (newValue.content && newValue.content.nodeType === 11) {
          children = Array.prototype.slice.call(newValue.content.childNodes);
        } else if (newValue.nodeType) {
          children = [newValue];
        } else if (typeof newValue === 'string') {
          TEMPLATE.innerHTML = newValue.toString();
          children = Array.prototype.slice.call(TEMPLATE.content.childNodes);
        } else {
          children = Array.prototype.slice.call(newValue);
        }
        if (children.length === 0) dom.textContent = '';else makeChildrenEqual$1(dom, children);
      } else {
        if (dom.data != newValue) {
          dom.data = newValue;
        }
      }
    }
    element.onUpdate();
  }
  var update = {
    update: customElementUpdate,
    simpleUpdate: simpleElementUpdate
  };

  const {
    TEMPLATE: TEMPLATE$1
  } = constants;
  var template = (str, ...extra) => {
    const tmp = TEMPLATE$1();
    if (typeof str === 'string') ; else if (str[0] && typeof str[0] === 'string') {
      str = String.raw(str, ...extra);
    } else if (str[0]) {
      Array.from(str).forEach(s => {
        tmp.content.appendChild(s);
      });
      return tmp;
    } else {
      return str;
    }
    str = str.replace(/>\n+/g, '>').replace(/\s+</g, '<').replace(/>\s+/g, '>').replace(/(\\)?\$(\\)?\{/g, '${');
    tmp.innerHTML = str;
    return tmp;
  };

  class Loader {
    constructor(elemName, url) {
      if (!fetch) throw Error('Sifrr.Dom.load requires Sifrr.Fetch to work.');
      if (this.constructor.all[elemName]) return this.constructor.all[elemName];
      this.elementName = elemName;
      this.url = url;
    }
    get html() {
      if (this._html) return this._html;
      Loader.add(this.elementName, this);
      const me = this;
      this._html = fetch.file(this.htmlUrl).then(resp => resp.text()).then(file => template(file).content).then(content => {
        me.template = content.querySelector('template');
        return content;
      });
      return this._html;
    }
    get js() {
      if (this._js) return this._js;
      Loader.add(this.elementName, this);
      this._js = fetch.file(this.jsUrl).then(resp => resp.text());
      return this._js;
    }
    get htmlUrl() {
      return this.url || `${window.Sifrr.Dom.config.baseUrl + '/'}elements/${this.elementName.split('-').join('/')}.html`;
    }
    get jsUrl() {
      return this.url || `${window.Sifrr.Dom.config.baseUrl + '/'}elements/${this.elementName.split('-').join('/')}.js`;
    }
    executeScripts(js) {
      if (this._executed) return window.console.log(`'${this.elementName}' element's javascript was already executed`);
      this._executed = true;
      if (!js) {
        return this.executeHTMLScripts();
      } else {
        return this.js.then(script => {
          new Function(script + `\n //# sourceURL=${this.jsUrl}`).call(window);
        }).catch(e => {
          window.console.error(e);
          window.console.log(`JS file for '${this.elementName}' gave error. Trying to get html file.`);
          return this.executeHTMLScripts();
        });
      }
    }
    executeHTMLScripts() {
      return this.html.then(file => {
        file.querySelectorAll('script').forEach(script => {
          if (script.src) {
            const newScript = constants.SCRIPT();
            newScript.src = script.src;
            newScript.type = script.type;
            window.document.body.appendChild(newScript);
          } else {
            new Function(script.text + `\n //# sourceURL=${this.htmlUrl}`).call(window);
          }
        });
      }).catch(e => {
        throw e;
      });
    }
    static add(elemName, instance) {
      Loader._all[elemName] = instance;
    }
    static get all() {
      return Loader._all;
    }
  }
  Loader._all = {};
  var loader = Loader;

  const {
    collect: collect$2,
    create: create$2
  } = ref;
  const {
    simpleUpdate
  } = update;
  const {
    simpleCreator
  } = creator;
  const setProps = (me, stateMap) => {
    me.stateMap = stateMap;
    me._refs = collect$2(me, stateMap);
    Object.defineProperty(me, 'state', {
      get: () => me._state,
      set: v => {
        me._state = Object.assign(me._state || {}, v);
        simpleUpdate(me);
      }
    });
    return;
  };
  function SimpleElement(content, defaultState = null) {
    let templ;
    if (typeof content === 'string') {
      templ = template(content);
      content = templ.content.firstElementChild || templ.content.firstChild;
    } else if (!content.nodeType) {
      throw TypeError('First argument for SimpleElement should be of type string or DOM element');
    }
    if (content.isSifrr) return content;
    if (content.nodeName.indexOf('-') !== -1 ||
    content.getAttribute && content.getAttribute('is') && content.getAttribute('is').indexOf('-') !== -1) {
      window.document.body.appendChild(content);
      content.remove();
      return content;
    }
    const baseStateMap = create$2(content, simpleCreator);
    setProps(content, baseStateMap);
    if (defaultState) content.state = defaultState;
    content.sifrrClone = function (deep = true) {
      const clone = content.cloneNode(deep);
      setProps(clone, baseStateMap);
      if (content.state) clone.state = content.state;
      return clone;
    };
    return content;
  }
  var simpleelement = SimpleElement;

  const {
    update: update$1
  } = update;
  const {
    makeChildrenEqual: makeChildrenEqual$2
  } = makeequal;
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
        return (loader.all[this.elementName] || {
          template: false
        }).template;
      }
      static get ctemp() {
        this._ctemp = this._ctemp || this.template;
        if (window.ShadyCSS && this.useShadowRoot && !this._ctemp.shady) {
          window.ShadyCSS.prepareTemplate(this._ctemp, this.elementName);
          this._ctemp.shady = true;
        }
        return this._ctemp;
      }
      static get stateMap() {
        this._stateMap = this._stateMap || parser.createStateMap(this.ctemp.content);
        return this._stateMap;
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
          this._refs = parser.collectRefs(content, this.constructor.stateMap);
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
        if (!this.constructor.useShadowRoot) {
          makeChildrenEqual$2(this, Array.prototype.slice.call(this.__content.childNodes));
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
        update$1(this);
      }
      onUpdate() {}
      isSifrr(name = null) {
        if (name) return name === this.constructor.elementName;else return true;
      }
      sifrrClone(deep) {
        return this.cloneNode(deep);
      }
      clearState() {
        this._state = {};
        this.update();
      }
      $(args, sr = true) {
        if (this.constructor.useShadowRoot && sr) return this.shadowRoot.querySelector(args);else return this.querySelector(args);
      }
      $$(args, sr = true) {
        if (this.constructor.useShadowRoot && sr) return this.shadowRoot.querySelectorAll(args);else return this.querySelectorAll(args);
      }
      static addArrayToDom(key, template) {
        this._arrayToDom = this._arrayToDom || {};
        this._arrayToDom[key] = simpleelement(template);
      }
      arrayToDom(key, newState = this.state[key]) {
        this._domL = this._domL || {};
        const oldL = this._domL[key] || 0;
        const newL = newState.length;
        const domArray = new Array(newL);
        let temp;
        try {
          temp = this.constructor._arrayToDom[key];
          if (!temp) throw Error('');
        } catch (e) {
          return window.console.error(`[error]: No arrayToDom data of '${key}' added in ${this.constructor.elementName}.`);
        }
        for (let i = 0; i < newL; i++) {
          if (i < oldL) {
            domArray[i] = {
              type: 'stateChange',
              state: newState[i]
            };
          } else {
            const el = temp.sifrrClone(true);
            el.state = newState[i];
            domArray[i] = el;
          }
        }
        this._domL[key] = newL;
        return domArray;
      }
    };
  }
  var element = elementClassFactory(window.HTMLElement);

  const SYNTHETIC_EVENTS = {};
  const opts = {
    capture: true,
    passive: true
  };
  const nativeToSyntheticEvent = (e, name) => {
    return Promise.resolve((() => {
      const target = e.composedPath ? e.composedPath()[0] : e.target;
      let dom = target;
      while (dom) {
        const eventHandler = dom[`_${name}`] || (dom.getAttribute ? dom.getAttribute(`_${name}`) : null);
        if (typeof eventHandler === 'function') {
          eventHandler.call(dom._root || window, e, target);
        } else if (typeof eventHandler === 'string') {
          new Function('event', 'target', eventHandler).call(dom._root || window, event, target);
        }
        cssMatchEvent(e, name, dom, target);
        dom = dom.parentNode || dom.host;
      }
    })());
  };
  const cssMatchEvent = (e, name, dom, target) => {
    function callEach(fxns) {
      fxns.forEach(fxn => fxn(e, target, dom));
    }
    for (let css in SYNTHETIC_EVENTS[name]) {
      if (typeof dom.matches === 'function' && dom.matches(css) || dom.nodeType === 9 && css === 'document') callEach(SYNTHETIC_EVENTS[name][css]);
    }
  };
  const Event = {
    all: SYNTHETIC_EVENTS,
    add: name => {
      if (SYNTHETIC_EVENTS[name]) return false;
      window.addEventListener(name, event => nativeToSyntheticEvent(event, name), opts);
      SYNTHETIC_EVENTS[name] = {};
      return true;
    },
    addListener: (name, css, fxn) => {
      const fxns = SYNTHETIC_EVENTS[name][css] || [];
      if (fxns.indexOf(fxn) < 0) fxns.push(fxn);
      SYNTHETIC_EVENTS[name][css] = fxns;
      return true;
    },
    removeListener: (name, css, fxn) => {
      const fxns = SYNTHETIC_EVENTS[name][css] || [],
            i = fxns.indexOf(fxn);
      if (i >= 0) fxns.splice(i, 1);
      SYNTHETIC_EVENTS[name][css] = fxns;
      return true;
    },
    trigger: (el, name, options) => {
      if (typeof el === 'string') el = document.querySelector(el);
      el.dispatchEvent(new window.Event(name, Object.assign({
        bubbles: true,
        composed: true
      }, options)));
    },
    opts,
    nativeToSyntheticEvent
  };
  var event_1 = Event;

  let SifrrDom = {};
  SifrrDom.elements = {};
  SifrrDom.loadingElements = [];
  SifrrDom.Element = element;
  SifrrDom.Parser = parser;
  SifrrDom.Loader = loader;
  SifrrDom.SimpleElement = simpleelement;
  SifrrDom.Event = event_1;
  SifrrDom.makeEqual = makeequal;
  SifrrDom.template = template;
  SifrrDom.register = (Element, options) => {
    Element.useSR = SifrrDom.config.useShadowRoot;
    const name = Element.elementName;
    if (!name) {
      throw Error('Error creating Custom Element: No name given.', Element);
    } else if (window.customElements.get(name)) {
      throw Error(`Error creating Element: ${name} - Custom Element with this name is already defined.`);
    } else if (name.indexOf('-') < 1) {
      throw Error(`Error creating Element: ${name} - Custom Element name must have one dash '-'`);
    } else {
      try {
        window.customElements.define(name, Element, options);
        SifrrDom.elements[name] = Element;
        return true;
      } catch (error) {
        window.console.error(`Error creating Custom Element: ${name} - ${error.message}`, error.trace);
        return false;
      }
    }
  };
  SifrrDom.setup = function (config) {
    HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
    HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
    SifrrDom.config = Object.assign({
      baseUrl: '',
      useShadowRoot: true
    }, config);
    if (typeof SifrrDom.config.baseUrl !== 'string') throw Error('baseUrl should be a string');
    SifrrDom.Event.add('input');
    SifrrDom.Event.add('change');
    SifrrDom.Event.addListener('input', 'document', SifrrDom.Parser.twoWayBind);
    SifrrDom.Event.addListener('change', 'document', SifrrDom.Parser.twoWayBind);
  };
  SifrrDom.load = function (elemName, {
    url,
    js = true
  } = {}) {
    if (window.customElements.get(elemName)) {
      return window.console.warn(`Error loading Element: ${elemName} - Custom Element with this name is already defined.`);
    }
    let loader$$1 = new SifrrDom.Loader(elemName, url);
    SifrrDom.loadingElements.push(customElements.whenDefined(elemName));
    return loader$$1.executeScripts(js);
  };
  SifrrDom.loading = () => {
    return Promise.all(SifrrDom.loadingElements);
  };
  var sifrr_dom = SifrrDom;

  return sifrr_dom;

}));
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.dom.js.map
