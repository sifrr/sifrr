/*! Sifrr.Dom v0.1.0-alpha - sifrr project - 2018/12/13 20:11:22 UTC */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Sifrr = global.Sifrr || {}, global.Sifrr.Dom = factory());
}(this, (function () { 'use strict';

  class Vdom {
    constructor(element, html) {
      this.baseElement = element;
      this.html = html;
      this.originalVdom = Vdom.toVdom(html);
    }
    updateState() {}
    newVdom() {}
    static toVdom(html) {
      if (Array.isArray(html)) {
        let ret = [];
        while (html.length) {
          ret.push(Vdom.toVdom(html.shift()));
        }
        return ret;
      }
      if (html.nodeType === 3) {
        return {
          tag: '#text',
          data: html.nodeValue,
          dom: html
        };
      }
      const attrs = html.attributes || [],
            l = attrs.length;
      let attr = {};
      for (let i = 0; i < l; i++) {
        attr[attrs[i].name] = attrs[i].value;
      }
      return {
        tag: html.nodeName,
        attrs: attr,
        children: Vdom.toVdom(Array.prototype.slice.call(html.childNodes)),
        dom: html
      };
    }
    static toHtml(vdom) {
      if (!vdom) {
        return vdom;
      }
      if (Array.isArray(vdom)) {
        let ret = [];
        while (vdom.length) {
          ret.push(Vdom.toHtml(vdom.shift()));
        }
        return ret;
      }
      if (vdom.dom) return vdom.dom;
      let html;
      switch (vdom.tag) {
        case '#text':
          html = document.createTextNode(vdom.data);
          break;
        case '#comment':
          html = document.createComment('comment');
          break;
        default:
          html = document.createElement(vdom.tag);
          for (let name in vdom.attrs) {
            html.setAttribute(name, vdom.attrs[name]);
          }
          html.append(...Vdom.toHtml(vdom.children));
          break;
      }
      return html;
    }
  }
  var vdom = Vdom;

  const Parser = {
    sifrrNode: window.document.createElement('sifrr-node'),
    createStateMap: function (element, shadowRoot = element.shadowRoot) {
      element.stateMap = Parser._createStateMap(shadowRoot);
    },
    _createStateMap: function (html) {
      let nodes = [],
          attributes = [];
      if (Array.isArray(html)) {
        while (html.length) {
          const map = Parser._createStateMap(html.shift());
          Array.prototype.push.apply(nodes, map.nodes);
          Array.prototype.push.apply(attributes, map.attributes);
        }
        return { nodes: nodes, attributes: attributes };
      }
      if (html.nodeType === 3) {
        return Parser.createTextStateMap(html);
      }
      Array.prototype.push.apply(attributes, Parser.createAttributeStateMap(html));
      const children = Parser._createStateMap(Array.prototype.slice.call(html.childNodes));
      Array.prototype.push.apply(nodes, children.nodes);
      Array.prototype.push.apply(attributes, children.attributes);
      return { nodes: nodes, attributes: attributes };
    },
    createTextStateMap: function (textElement) {
      const x = textElement.nodeValue;
      let nodes = [];
      if (x.indexOf('${') > -1) {
        if (textElement.parentNode.contentEditable != 'true' && textElement.parentNode.dataset && textElement.parentNode.dataset.sifrrHtml == 'true') {
          nodes.push({
            tag: textElement.parentNode.nodeName,
            data: textElement.parentNode.innerHTML,
            dom: textElement.parentNode
          });
          textElement.parentNode.originalVdom = vdom.toVdom(textElement.parentNode);
        } else if (textElement.parentNode.contentEditable == 'true' || textElement.parentNode.nodeName == 'TEXTAREA' || textElement.parentNode.nodeName == 'STYLE') {
          nodes.push({
            tag: textElement.parentNode.nodeName,
            data: x,
            dom: textElement.parentNode
          });
        } else {
          nodes.push({
            tag: '#text',
            data: x,
            dom: textElement
          });
        }
      }
      return { nodes: nodes, attributes: [] };
    },
    createAttributeStateMap: function (element) {
      const attrs = element.attributes || [],
            l = attrs.length;
      let attributes = [];
      for (let i = 0; i < l; i++) {
        const attribute = attrs[i];
        if (attribute.value.indexOf('${') > -1) {
          attributes.push({
            name: attribute.name,
            value: attribute.value,
            dom: element
          });
        }
      }
      return attributes;
    },
    twoWayBind: function (e) {
      const target = e.path ? e.path[0] : e.target;
      if (!target.dataset.sifrrBind) return;
      const value = target.value === undefined ? target.innerHTML : target.value;
      let data = {};
      data[target.dataset.sifrrBind] = value;
      target.getRootNode().host.state = data;
    },
    updateState: async function (element) {
      if (!element.stateMap) {
        return false;
      }
      const nodes = element.stateMap.nodes,
            nodesL = nodes.length;
      for (let i = 0; i < nodesL; i++) {
        Parser.updateNode(nodes[i], element);
      }
      const attributes = element.stateMap.attributes,
            attributesL = attributes.length;
      for (let i = 0; i < attributesL; i++) {
        Parser.updateAttribute(attributes[i], element);
      }
    },
    updateNode: function (node, element) {
      const realHTML = node.dom.innerHTML;
      const newHTML = Parser.evaluateString(node.data, element);
      if (realHTML == newHTML) return;
      if (newHTML === undefined) return node.dom.textContent = '';
      if (Array.isArray(newHTML) && newHTML[0] && newHTML[0].nodeType) {
        node.dom.innerHTML = '';
        node.dom.append(...newHTML);
      } else if (newHTML.nodeType) {
        node.dom.innerHTML = '';
        node.dom.appendChild(newHTML);
      } else {
        if (node.dom.dataset && node.dom.dataset.sifrrHtml == 'true') {
          node.dom.innerHTML = newHTML.toString().replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>').replace(/(&lt;)(input|link|img|br|hr|col|keygen)(((?!&gt;).)*)(&gt;)/g, '<$2$3>');
        } else {
          if (node.dom.nodeName == 'TEXTAREA') {
            if (node.dom.value !== newHTML) node.dom.value = newHTML;
          } else if (node.dom.textContent !== newHTML) {
            node.dom.textContent = newHTML.toString();
          }
        }
      }
    },
    updateAttribute: function (attr, element) {
      const val = Parser.evaluateString(attr.value, element);
      attr.dom.setAttribute(attr.name, val);
      if (attr.dom.nodeName == 'SELECT' && attr.name == 'value') attr.dom.value = val;
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
    static get elementName() {
      return this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
    constructor() {
      super();
      this._state = Object.assign({}, this.constructor.defaultState, json.parse(this.dataset.sifrrState), this.state);
      this.attachShadow({
        mode: 'open'
      });
      const me = this,
            content = this.constructor.template.content.cloneNode(true);
      parser.createStateMap(this, content);
      me.shadowRoot.appendChild(content);
      this.shadowRoot.addEventListener('change', parser.twoWayBind);
    }
    connectedCallback() {
      parser.updateState(this);
    }
    disconnectedCallback() {
      if (this.shadowRoot) this.shadowRoot.removeEventListener('change', parser.twoWayBind);else this.removeEventListener('change', parser.twoWayBind);
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

  const nativeToSyntheticEvent = (event, name) => {
    let dom = event.target;
    while (dom !== null) {
      const eventHandler = dom[`$${name}`];
      if (eventHandler) {
        eventHandler();
        return;
      }
      dom = dom.parentNode;
    }
  };
  const SYNTHETIC_EVENTS = {};
  var event = name => {
    if (SYNTHETIC_EVENTS[name]) return;
    document.addEventListener(name, event => nativeToSyntheticEvent(event, name));
    SYNTHETIC_EVENTS[name] = true;
  };

  let SifrrDOM = {};
  SifrrDOM.elements = {};
  SifrrDOM.Element = element;
  SifrrDOM.Parser = parser;
  SifrrDOM.Vdom = vdom;
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
  SifrrDOM.addSifrrEvent = event;
  SifrrDOM.setup = function () {
    window.document.addEventListener('input', SifrrDOM.Parser.twoWayBind, { capture: true, passive: true });
    window.document.addEventListener('blur', SifrrDOM.Parser.twoWayBind, { capture: true, passive: true });
  };
  SifrrDOM.load = function (elemName) {
    let loader$$1 = new SifrrDOM.Loader(elemName);
    loader$$1.executeScripts();
  };
  var sifrr_dom = SifrrDOM;

  return sifrr_dom;

})));
/*! (c) @aadityataparia */
