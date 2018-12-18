/*! Sifrr.Dom v0.1.0-alpha - sifrr project - 2018/12/18 22:29:13 UTC */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Sifrr = global.Sifrr || {}, global.Sifrr.Dom = factory());
}(this, (function () { 'use strict';

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
        attrValue,
        fromValue,
        attrName,
        attr;
    for (var i = newAttrs.length - 1; i >= 0; --i) {
      attr = newAttrs[i];
      attrName = attr.name;
      attrValue = attr.value;
      if (!oldNode.hasAttribute(attrName)) {
        oldNode.setAttribute(attrName, attrValue);
      } else {
        fromValue = oldNode.getAttribute(attrName);
        if (fromValue !== attrValue) {
          if (attrValue === 'null' || attrValue === 'undefined' || attrValue === 'false' || !attrValue) {
            oldNode.removeAttribute(attrName);
          } else {
            oldNode.setAttribute(attrName, attrValue);
          }
        }
      }
    }
    for (var j = oldAttrs.length - 1; j >= 0; --j) {
      attr = oldAttrs[j];
      if (attr.specified !== false) {
        attrName = attr.name;
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

  const { makeChildrenEqual: makeChildrenEqual$1 } = makeequal;
  const TREE_WALKER = window.document.createTreeWalker(document, NodeFilter.SHOW_ALL, null, false);
  TREE_WALKER.roll = function (n) {
    let tmp;
    while (--n) tmp = this.nextNode();
    return tmp;
  };
  class Ref {
    constructor(idx, ref) {
      this.idx = idx;
      this.ref = ref;
    }
  }
  const Parser = {
    sifrrNode: window.document.createElement('sifrr-node'),
    collectRefs: function (element, stateMap) {
      const refs = [];
      const w = TREE_WALKER;
      w.currentNode = element;
      stateMap.map(x => refs.push({
        dom: w.roll(x.idx),
        data: x.ref
      }));
      return refs;
    },
    createStateMap: function (element) {
      let node;
      if (element.useShadowRoot) node = element.shadowRoot;else node = element;
      let indices = [],
          ref,
          idx = 0;
      TREE_WALKER.currentNode = node;
      do {
        if (ref = collector(node)) {
          indices.push(new Ref(idx + 1, ref));
          idx = 1;
        } else {
          idx++;
        }
      } while (node = TREE_WALKER.nextNode());
      function collector(el) {
        if (el.nodeType === window.Node.TEXT_NODE) {
          const textStateMap = Parser.createTextStateMap(el);
          if (textStateMap) return textStateMap;
        } else if (el.nodeType === window.Node.COMMENT_NODE && el.nodeValue.trim()[0] == '$') {
          return {
            html: false,
            text: el.nodeValue.trim()
          };
        } else if (el.nodeType === window.Node.ELEMENT_NODE) {
          let ref = {};
          if (el.dataset && el.dataset.sifrrHtml == 'true' || el.contentEditable == 'true' || el.nodeName == 'TEXTAREA' || el.nodeName == 'STYLE') {
            ref.html = true;
            ref.text = el.innerHTML.replace(/<!--(.*)-->/g, '$1');
          }
          const attrStateMap = Parser.createAttributeStateMap(el);
          if (attrStateMap) ref.attributes = attrStateMap;
          if (Object.keys(ref).length > 0) return ref;
        }
      }
      return indices;
    },
    createTextStateMap: function (textElement) {
      const x = textElement.nodeValue;
      if (x.indexOf('${') > -1) {
        if (textElement.parentNode.dataset && textElement.parentNode.dataset.sifrrHtml == 'true' || textElement.parentNode.contentEditable == 'true' || textElement.parentNode.nodeName == 'TEXTAREA' || textElement.parentNode.nodeName == 'STYLE') {
          return;
        } else {
          return {
            html: false,
            text: x
          };
        }
      }
    },
    createAttributeStateMap: function (element) {
      const attrs = element.attributes || [],
            l = attrs.length;
      let attributes = {};
      for (let i = 0; i < l; i++) {
        const attribute = attrs[i];
        if (attribute.value.indexOf('${') > -1) {
          attributes[attribute.name] = attribute.value;
        }
      }
      if (Object.keys(attributes).length > 0) return attributes;
    },
    twoWayBind: function (e) {
      const target = e.path ? e.path[0] : e.target;
      if (!target.dataset.sifrrBind) return;
      const value = target.value === undefined ? target.innerHTML : target.value;
      let data = {};
      data[target.dataset.sifrrBind] = value;
      target.getRootNode().host.state = data;
    },
    updateState: function (element) {
      if (!element._refs) {
        return false;
      }
      const l = element._refs.length;
      for (let i = 0; i < l; i++) {
        Parser.updateNode(element._refs[i], element);
      }
      if (typeof this.onStateUpdate === 'function') this.onStateUpdate();
    },
    updateNode: function (ref, base) {
      if (ref.data.attributes) {
        Parser.updateAttribute(ref, base);
      }
      if (ref.data.html === undefined) return;
      const oldHTML = ref.dom.innerHTML;
      const newHTML = Parser.evaluateString(ref.data.text, base);
      if (oldHTML == newHTML) return;
      if (newHTML === undefined) return ref.dom.textContent = '';
      if (ref.data.html) {
        let children;
        if (Array.isArray(newHTML)) {
          children = newHTML;
        } else if (newHTML.nodeType) {
          children = [newHTML];
        } else {
          const docFrag = Parser.sifrrNode.cloneNode();
          docFrag.innerHTML = newHTML.toString().replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>').replace(/(&lt;)(input|link|img|br|hr|col|keygen)(((?!&gt;).)*)(&gt;)/g, '<$2$3>');
          children = docFrag.childNodes;
        }
        makeChildrenEqual$1(ref.dom, children);
      } else {
        if (ref.dom.textContent == newHTML) return;
        ref.dom.textContent = newHTML;
      }
    },
    updateAttribute: function (ref, base) {
      const element = ref.dom;
      for (let key in ref.data.attributes) {
        const val = Parser.evaluateString(ref.data.attributes[key], base);
        if (val === 'null' || val === 'undefined' || val === 'false' || !val) {
          element.removeAttribute(key);
        } else {
          const oldVal = element.getAttribute(key);
          if (oldVal != val) element.setAttribute(key, val);
        }
        if (element.nodeName == 'SELECT' && key == 'value') element.value = val;
      }
    },
    evaluateString: function (string, element) {
      if (string.indexOf('${') < 0) return string;
      string = string.trim();
      if (string.match(/^\${([^{}$]|{([^{}$])*})*}$/)) return replacer(string);
      return replacer('`' + string + '`');
      function replacer(match) {
        if (match[0] == '$') match = match.slice(2, -1);
        let f;
        if (match.search('return') >= 0) {
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
    static deepClone(json) {
      if (Array.isArray(json)) return Array.prototype.slice.call(json);
      if (typeof json !== 'object') return json;
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
    constructor(elemName) {
      if (this.constructor.all[elemName]) return this.constructor.all[elemName];
      this.elementName = elemName;
    }
    get html() {
      const me = this;
      return sifrr_fetch.file(this.htmlUrl).then(resp => resp.text()).then(file => new window.DOMParser().parseFromString(file, 'text/html')).then(html => {
        Loader.add(me.elementName, html.querySelector('template'));
        return html;
      });
    }
    get htmlUrl() {
      return `/elements/${this.elementName.split('-').join('/')}.html`;
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

  class Element extends window.HTMLElement {
    static get observedAttributes() {
      return ['data-sifrr-state'].concat(this.observedAttrs || []);
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
      this.useShadowRoot = this.constructor.template.dataset.noSr ? false : true;
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
    }
    disconnectedCallback() {
      if (this.useShadowRoot) this.shadowRoot.removeEventListener('change', parser.twoWayBind);else this.removeEventListener('change', parser.twoWayBind);
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
      if (attrName === 'data-sifrr-state') {
        this.state = json.parse(newVal);
      }
    }
    get state() {
      return this._state;
    }
    set state(v) {
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
    srqs(args) {
      return this.shadowRoot.querySelector(args);
    }
    srqsAll(args) {
      return this.shadowRoot.querySelectorAll(args);
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
  SifrrDOM.setup = function () {
    SifrrDOM.addEvent('input');
    SifrrDOM.addEvent('change');
    window.document.$input = SifrrDOM.Parser.twoWayBind;
    window.document.$change = SifrrDOM.Parser.twoWayBind;
  };
  SifrrDOM.load = function (elemName) {
    let loader$$1 = new SifrrDOM.Loader(elemName);
    loader$$1.executeScripts();
  };
  var sifrr_dom = SifrrDOM;

  return sifrr_dom;

})));
/*! (c) @aadityataparia */
