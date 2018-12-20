/*! Sifrr.Dom v0.0.1-alpha - sifrr project - 2018/12/20 16:22:43 UTC */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Sifrr = global.Sifrr || {}, global.Sifrr.Dom = factory());
}(this, (function () { 'use strict';

  function updateAttribute(element, name, newValue) {
    if (!element.hasAttribute(name)) {
      element.setAttribute(name, newValue);
    } else {
      const fromValue = element.getAttribute(name);
      if (fromValue !== newValue) {
        if (newValue === 'null' || newValue === 'undefined' || newValue === 'false' || !newValue) {
          element.removeAttribute(name);
        } else {
          element.setAttribute(name, newValue);
        }
      }
    }
    if (element.nodeName == 'SELECT' && name == 'value') element.value = newValue;
  }
  var update = {
    updateAttribute: updateAttribute
  };

  const { updateAttribute: updateAttribute$1 } = update;
  function makeChildrenEqual(parent, newChildren) {
    if (!Array.isArray(newChildren)) newChildren = Array.prototype.slice.call(newChildren);
    if (newChildren.length === 0) {
      parent.textContent = '';
      return;
    }
    let l = parent.childNodes.length;
    if (l > newChildren.length) {
      let i = l,
          tail = parent.lastChild,
          tmp;
      while (i > newChildren.length) {
        tmp = tail.previousSibling;
        parent.removeChild(tail);
        tail = tmp;
        i--;
      }
    }
    let head = parent.firstChild;
    for (let i = 0, item; i < newChildren.length; i++) {
      item = newChildren[i];
      if (!head && item) {
        parent.appendChild(item);
      } else {
        head = makeEqual(head, item).nextSibling;
      }
    }
  }
  function makeEqual(oldNode, newNode) {
    if (newNode === null) return oldNode;
    if (newNode.type === 'stateChange') {
      if (oldNode.state !== newNode.state) oldNode.state = newNode.state;
      return oldNode;
    }
    if (oldNode.nodeName !== newNode.nodeName) {
      oldNode.replaceWith(newNode);
      return newNode;
    }
    if (oldNode.nodeType === window.Node.TEXT_NODE || oldNode.nodeType === window.Node.COMMENT_NODE) {
      if (oldNode.nodeValue !== newNode.nodeValue) {
        oldNode.nodeValue = newNode.nodeValue;
      }
      return oldNode;
    }
    oldNode.state = newNode.state;
    let oldAttrs = oldNode.attributes,
        newAttrs = newNode.attributes,
        attr;
    for (var i = newAttrs.length - 1; i >= 0; --i) {
      attr = newAttrs[i];
      const attrName = attr.name;
      const attrValue = attr.value;
      updateAttribute$1(oldNode, attrName, attrValue);
    }
    for (var j = oldAttrs.length - 1; j >= 0; --j) {
      attr = oldAttrs[j];
      if (attr.specified !== false) {
        const attrName = attr.name;
        if (!newNode.hasAttribute(attrName)) {
          oldNode.removeAttribute(attrName);
        }
      }
    }
    makeChildrenEqual(oldNode, newNode.childNodes);
    return oldNode;
  }
  var makeequal = {
    makeEqual: makeEqual,
    makeChildrenEqual: makeChildrenEqual
  };

  const TREE_WALKER = window.document.createTreeWalker(document, NodeFilter.SHOW_ALL, null, false);
  TREE_WALKER.roll = function (n, filter = false) {
    let node = this.currentNode;
    while (--n) {
      if (filter && filter(node)) {
        node = TREE_WALKER.nextSibling() || TREE_WALKER.parentNode();
      } else node = TREE_WALKER.nextNode();
    }
    return node;
  };
  function collect(element, stateMap = element.stateMap, filter) {
    const refs = [];
    TREE_WALKER.currentNode = element;
    stateMap.map(x => refs.push(TREE_WALKER.roll(x.idx, filter)));
    return refs;
  }
  class Ref {
    constructor(idx, ref) {
      this.idx = idx;
      this.ref = ref;
    }
  }
  function create(node, fxn, filter = false) {
    let indices = [],
        ref,
        idx = 0;
    TREE_WALKER.currentNode = node;
    while (node) {
      if (ref = fxn(node)) {
        indices.push(new Ref(idx + 1, ref));
        idx = 1;
      } else {
        idx++;
      }
      if (filter && filter(node)) {
        node = TREE_WALKER.nextSibling() || TREE_WALKER.parentNode();
      } else node = TREE_WALKER.nextNode();
    }
    return indices;
  }
  var ref = {
    walker: TREE_WALKER,
    collect: collect,
    create: create,
    klass: Ref
  };

  const { makeChildrenEqual: makeChildrenEqual$1 } = makeequal;
  const { updateAttribute: updateAttribute$2 } = update;
  const SIFRR_NODE = window.document.createElement('sifrr-node'),
        TEXT_NODE = 3,
        COMMENT_NODE = 8,
        ELEMENT_NODE = 1;
  function isHtml(el) {
    return el.dataset && el.dataset.sifrrHtml == 'true' || el.contentEditable == 'true' || el.nodeName == 'TEXTAREA' || el.nodeName == 'STYLE';
  }
  function createStateMap(el) {
    if (el.nodeType === TEXT_NODE) {
      const x = el.nodeValue;
      if (x.indexOf('${') > -1) return {
        html: false,
        text: x
      };
    } else if (el.nodeType === COMMENT_NODE && el.nodeValue.trim()[0] == '$') {
      return {
        html: false,
        text: el.nodeValue.trim()
      };
    } else if (el.nodeType === ELEMENT_NODE) {
      const ref$$1 = {};
      if (isHtml(el)) {
        ref$$1.html = true;
        ref$$1.text = el.innerHTML.replace(/<!--(.*)-->/g, '$1');
      }
      const attrs = el.attributes || [],
            l = attrs.length;
      const attrStateMap = {};
      for (let i = 0; i < l; i++) {
        const attribute = attrs[i];
        if (attribute.value.indexOf('${') > -1) {
          attrStateMap[attribute.name] = attribute.value;
        }
      }
      if (Object.keys(attrStateMap).length > 0) ref$$1.attributes = attrStateMap;
      if (Object.keys(ref$$1).length > 0) return ref$$1;
    }
    return 0;
  }
  const Parser = {
    collectRefs: (el, stateMap) => ref.collect(el, stateMap, isHtml),
    createStateMap: function (element) {
      let node;
      if (element.useShadowRoot) node = element.shadowRoot;else node = element;
      return ref.create(node, createStateMap, isHtml);
    },
    updateState: function (element) {
      if (!element._refs) {
        return false;
      }
      const l = element._refs.length;
      for (let i = 0; i < l; i++) {
        const data = element.constructor.stateMap[i].ref;
        const dom = element._refs[i];
        if (data.attributes) {
          for (let key in data.attributes) {
            const val = Parser.evaluateString(data.attributes[key], element);
            updateAttribute$2(dom, key, val);
          }
        }
        if (data.html === undefined) continue;
        const newHTML = Parser.evaluateString(data.text, element);
        if (newHTML === undefined) {
          dom.textContent = '';continue;
        }
        if (data.html) {
          let children;
          if (Array.isArray(newHTML)) {
            children = newHTML;
          } else if (newHTML.nodeType) {
            children = [newHTML];
          } else {
            const docFrag = SIFRR_NODE.cloneNode();
            docFrag.innerHTML = newHTML.toString().replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>').replace(/(&lt;)(input|link|img|br|hr|col|keygen)(((?!&gt;).)*)(&gt;)/g, '<$2$3>');
            children = docFrag.childNodes;
          }
          if (children.length < 1) dom.textContent = '';else makeChildrenEqual$1(dom, children);
        } else {
          if (dom.nodeValue != newHTML) {
            dom.nodeValue = newHTML;
          }
        }
      }
      if (typeof this.onStateUpdate === 'function') this.onStateUpdate();
    },
    twoWayBind: function (e) {
      const target = e.path ? e.path[0] : e.target;
      if (!target.dataset.sifrrBind) return;
      const value = target.value === undefined ? target.innerHTML : target.value;
      let state = {};
      state[target.dataset.sifrrBind] = value;
      target.getRootNode().host.state = state;
    },
    evaluateString: function (string, element) {
      if (string.indexOf('${') < 0) return string;
      string = string.trim();
      if (string.match(/^\${([^{}$]|{([^{}$])*})*}$/)) return replacer(string);
      return replacer('`' + string + '`');
      function replacer(match) {
        if (match[0] == '$') match = match.slice(2, -1);
        let f;
        if (match.indexOf('return ') >= 0) {
          f = new Function(match).bind(element);
        } else {
          f = new Function('return ' + match).bind(element);
        }
        return f();
      }
    }
  };
  var parser = Parser;

  class Json {
    static parse(data) {
      let ans = {};
      if (typeof data == 'string') {
        try {
          ans = JSON.parse(data);
        } catch (e) {
          return data;
        }
        return this.parse(ans);
      } else if (Array.isArray(data)) {
        ans = [];
        data.forEach((v, i) => {
          ans[i] = this.parse(v);
        });
      } else if (typeof data == 'object') {
        for (const k in data) {
          ans[k] = this.parse(data[k]);
        }
      } else {
        return data;
      }
      return ans;
    }
    static stringify(data) {
      if (typeof data == 'string') {
        return data;
      } else {
        return JSON.stringify(data);
      }
    }
    static shallowEqual(a, b) {
      for (let key in a) {
        if (!(key in b) || a[key] != b[key]) {
          return false;
        }
      }
      for (let key in b) {
        if (!(key in a) || a[key] != b[key]) {
          return false;
        }
      }
      return true;
    }
    static deepClone(json) {
      if (Array.isArray(json)) return json.map(i => Json.deepClone(i));
      if (typeof json !== 'object' || json === null) return json;
      let clone = {};
      for (let key in json) {
        clone[key] = Json.deepClone(json[key]);
      }
      return clone;
    }
  }
  var json = Json;

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var sifrr_fetch = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
      module.exports = factory();
    })(commonjsGlobal, function () {
      class Request {
        constructor(type, url, options) {
          this.type = type;
          this._options = options;
          this._url = url;
        }
        get response() {
          return window.fetch(this.url, this.options).then(resp => {
            let contentType = resp.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              resp = resp.json();
            }
            if (resp.ok) {
              return resp;
            } else {
              let error = Error(resp.statusText);
              error.response = resp;
              throw error;
            }
          });
        }
        get url() {
          let params = delete this._options.params;
          if (params && Object.keys(params).length > 0) {
            return this._url + '?' + Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
          } else {
            return this._url;
          }
        }
        get options() {
          return Object.assign(this._options, {
            method: this.type,
            headers: Object.assign({
              'accept': 'application/json'
            }, this._options.headers || {}),
            mode: 'cors',
            redirect: 'follow'
          });
        }
      }
      var request = Request;
      class SifrrFetch {
        static get(url, options = {}) {
          return new request('GET', url, options).response;
        }
        static post(url, options = {}) {
          return new request('POST', url, options).response;
        }
        static put(url, options = {}) {
          return new request('PUT', url, options).response;
        }
        static delete(url, options = {}) {
          return new request('DELETE', url, options).response;
        }
        static file(url, options = {}) {
          options.headers = options.headers || {};
          options.headers.accept = options.headers.accept || '*/*';
          return new request('GET', url, options).response;
        }
      }
      var sifrr_fetch = SifrrFetch;
      return sifrr_fetch;
    });
  });

  class Loader {
    constructor(elemName, config = {}) {
      if (this.constructor.all[elemName]) return this.constructor.all[elemName];
      this.elementName = elemName;
      this.config = config;
    }
    get html() {
      const me = this;
      return sifrr_fetch.file(this.htmlUrl).then(resp => resp.text()).then(file => new window.DOMParser().parseFromString(file, 'text/html')).then(html => {
        Loader.add(me.elementName, html.querySelector('template'));
        return html;
      });
    }
    get htmlUrl() {
      return this.config.url || `${this.config.baseUrl || '/'}elements/${this.elementName.split('-').join('/')}.html`;
    }
    executeScripts() {
      return this.html.then(file => {
        file.querySelectorAll('script').forEach(script => {
          let fxn = new Function(script.text).bind(window);
          fxn();
        });
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

  const { collect: collect$1, create: create$1 } = ref;
  const compilerTemplate = document.createElement('template');
  function collector(node) {
    if (node.nodeType !== 3) {
      if (node.attributes !== undefined) {
        const attrs = Array.from(node.attributes),
              l = attrs.length;
        const ret = [];
        for (let i = 0; i < l; i++) {
          const avalue = attrs[i].value;
          if (avalue[0] === '$') {
            ret.push({
              name: attrs[i].name,
              text: avalue.slice(2, -1)
            });
          }
        }
        if (ret.length > 0) return ret;
      }
      return 0;
    } else {
      let nodeData = node.nodeValue;
      if (nodeData[0] === '$') {
        node.nodeValue = '';
        return nodeData.slice(2, -1);
      }
      return 0;
    }
  }
  function updateState(simpleEl) {
    const doms = simpleEl._refs,
          refs = simpleEl.stateMap,
          l = refs.length;
    const newState = simpleEl.state,
          oldState = simpleEl._oldState;
    for (let i = 0; i < l; i++) {
      const data = refs[i].ref,
            dom = doms[i];
      if (Array.isArray(data)) {
        const l = data.length;
        for (let i = 0; i < l; i++) {
          const attr = data[i];
          if (oldState[attr.text] != newState[attr.text]) dom.setAttribute(attr.name, newState[attr.text]);
        }
      } else {
        if (oldState[data] != newState[data]) dom.nodeValue = newState[data];
      }
    }
  }
  function SimpleElement(content, defaultState) {
    if (typeof content === 'string') {
      compilerTemplate.innerHTML = content;
      content = compilerTemplate.content.firstChild;
    }
    content.stateMap = create$1(content, collector);
    content._refs = collect$1(content, content.stateMap);
    Object.defineProperty(content, 'state', {
      get: () => content._state,
      set: v => {
        content._oldState = Object.assign({}, content._state);
        content._state = Object.assign(content._state || {}, v);
        updateState(content);
      }
    });
    if (defaultState) content.state = defaultState;
    content.sifrrClone = function (deep) {
      const clone = content.cloneNode(deep);
      clone.stateMap = content.stateMap;
      clone._refs = collect$1(clone, content.stateMap);
      Object.defineProperty(clone, 'state', {
        get: () => clone._state,
        set: v => {
          clone._oldState = Object.assign({}, clone._state);
          clone._state = Object.assign(clone._state || {}, v);
          updateState(clone);
        }
      });
      if (defaultState) clone.state = defaultState;
      return clone;
    };
    return content;
  }
  var simpleelement = SimpleElement;

  class Element extends window.HTMLElement {
    static get observedAttributes() {
      return ['data-sifrr-state'].concat(this.observedAttrs());
    }
    static observedAttrs() {
      return [];
    }
    static get template() {
      return loader.all[this.elementName];
    }
    static get stateMap() {
      this._stateMap = this._stateMap || parser.createStateMap(this.template.content);
      return this._stateMap;
    }
    static get elementName() {
      return this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
    constructor() {
      super();
      this._state = Object.assign({}, this.constructor.defaultState, json.parse(this.dataset.sifrrState), this.state);
      const content = this.constructor.template.content.cloneNode(true);
      this._refs = parser.collectRefs(content, this.constructor.stateMap);
      this.useShadowRoot = this.constructor.template.dataset.sr === 'false' ? false : this.constructor.useShadowRoot;
      if (this.useShadowRoot) {
        this.attachShadow({
          mode: 'open'
        });
        this.shadowRoot.appendChild(content);
        this.shadowRoot.addEventListener('change', parser.twoWayBind);
      } else this.appendChild(content);
    }
    connectedCallback() {
      parser.updateState(this);
      this.onConnect();
    }
    onConnect() {}
    disconnectedCallback() {
      if (this.useShadowRoot) this.shadowRoot.removeEventListener('change', parser.twoWayBind);
      this.onDisconnect();
    }
    onDisconnect() {}
    attributeChangedCallback(attrName, oldVal, newVal) {
      if (attrName === 'data-sifrr-state') {
        this.state = json.parse(newVal);
      }
      this.onAttributeChange();
    }
    onAttributeChange() {}
    get state() {
      return this._state;
    }
    set state(v) {
      this._oldState = this.state;
      Object.assign(this._state, v);
      parser.updateState(this);
    }
    isSifrr(name = null) {
      if (name) return name == this.constructor.elementName;else return true;
    }
    clearState() {
      this._state = {};
      parser.updateState(this);
    }
    qs(args, sr = true) {
      if (this.useShadowRoot && sr) return this.shadowRoot.querySelector(args);else return this.querySelector(args);
    }
    qsAll(args, sr = true) {
      if (this.useShadowRoot && sr) return this.shadowRoot.querySelectorAll(args);else return this.querySelectorAll(args);
    }
    static addArrayToDom(key, template) {
      this._arrayToDom = this._arrayToDom || {};
      this._arrayToDom[key] = simpleelement(template);
    }
    arrayToDom(key, newState = this.state[key]) {
      this._domL = this._domL || {};
      const oldL = this._domL[key];
      const domArray = [];
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
            domArray.push({ type: 'stateChange', state: newState[i] });
          } else {
            const el = this.constructor._arrayToDom[key].sifrrClone(true);
            el.state = newState[i];
            domArray.push(el);
          }
        }
      }
      this._domL[key] = newL;
      return domArray;
    }
  }
  var element = Element;

  const nativeToSyntheticEvent = (e, name) => {
    let dom = e.path ? e.path[0] : e.target;
    while (dom) {
      const eventHandler = dom[`$${name}`];
      if (eventHandler) {
        eventHandler(event, name);
      }
      dom = dom.parentNode || dom.host;
    }
  };
  const SYNTHETIC_EVENTS = {};
  var event_1 = name => {
    if (SYNTHETIC_EVENTS[name]) return false;
    window.document.addEventListener(name, event => nativeToSyntheticEvent(event, name), { capture: true, passive: true });
    SYNTHETIC_EVENTS[name] = true;
    return true;
  };

  let SifrrDOM = {};
  SifrrDOM.elements = {};
  SifrrDOM.Element = element;
  SifrrDOM.Parser = parser;
  SifrrDOM.makeEqual = makeequal;
  SifrrDOM.Loader = loader;
  SifrrDOM.register = function (Element) {
    Element.useShadowRoot = SifrrDOM.config.useShadowRoot;
    const name = Element.elementName;
    if (!name) {
      window.console.warn('Error creating Custom Element: No name given.', Element);
    } else if (window.customElements.get(name)) {
      window.console.warn(`Error creating Element: ${name} - Custom Element with this name is already defined.`);
    } else if (name.indexOf('-') < 1) {
      window.console.warn(`Error creating Element: ${name} - Custom Element name must have one dash '-'`);
    } else {
      try {
        window.customElements.define(name, Element);
        SifrrDOM.elements[name] = Element;
        return true;
      } catch (error) {
        window.console.warn(`Error creating Custom Element: ${name} - ${error}`);
        return false;
      }
    }
    return false;
  };
  SifrrDOM.addEvent = event_1;
  SifrrDOM.setup = function (config) {
    SifrrDOM.config = Object.assign({
      baseUrl: '/',
      useShadowRoot: true
    }, config);
    SifrrDOM.addEvent('input');
    SifrrDOM.addEvent('change');
    window.document.$input = SifrrDOM.Parser.twoWayBind;
    window.document.$change = SifrrDOM.Parser.twoWayBind;
  };
  SifrrDOM.SimpleElement = simpleelement;
  SifrrDOM.load = function (elemName, config = { baseUrl: SifrrDOM.config.baseUrl }) {
    let loader$$1 = new SifrrDOM.Loader(elemName, config);
    loader$$1.executeScripts();
  };
  var sifrr_dom = SifrrDOM;

  return sifrr_dom;

})));
/*! (c) @aadityataparia */
