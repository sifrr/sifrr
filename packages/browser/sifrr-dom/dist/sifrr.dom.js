/*! Sifrr.Dom v0.1.0-alpha - sifrr project - 2018/12/13 14:58:03 UTC */
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
    createStateMap: function (html) {
      let nodes = [],
          attributes = [];
      if (Array.isArray(html)) {
        while (html.length) {
          const map = Parser.createStateMap(html.shift());
          Array.prototype.push.apply(nodes, map.nodes);
          Array.prototype.push.apply(attributes, map.attributes);
        }
        return { nodes: nodes, attributes: attributes };
      }
      if (html.nodeType === 3) {
        const x = html.nodeValue;
        if (x.indexOf('${') > -1) {
          if (html.parentNode.contentEditable == 'true' || html.parentNode.nodeName == 'TEXTAREA' || html.parentNode.nodeName == 'STYLE' || html.parentNode.dataset && html.parentNode.dataset.sifrrHtml == 'true') {
            nodes.push({
              tag: html.parentNode.nodeName,
              data: html.parentNode.innerHTML,
              dom: html.parentNode
            });
            html.parentNode.originalVdom = vdom.toVdom(html.parentNode);
          } else {
            let sn = Parser.sifrrNode.cloneNode();
            const clone = html.cloneNode();
            sn.appendChild(clone);
            sn.originalVdom = {
              children: [{
                tag: '#text',
                data: x,
                dom: clone
              }]
            };
            html.replaceWith(sn);
            nodes.push({
              tag: 'sifrr-node',
              data: x,
              dom: sn
            });
          }
        }
        return { nodes: nodes, attributes: attributes };
      }
      const attrs = html.attributes || [],
            l = attrs.length;
      for (let i = 0; i < l; i++) {
        const attribute = attrs[i];
        if (attribute.value.indexOf('${') > -1) {
          attributes.push({
            name: attribute.name,
            value: attribute.value,
            dom: html
          });
        }
      }
      const children = Parser.createStateMap(Array.prototype.slice.call(html.childNodes));
      Array.prototype.push.apply(nodes, children.nodes);
      Array.prototype.push.apply(attributes, children.attributes);
      return { nodes: nodes, attributes: attributes };
    },
    twoWayBind: function (e) {
      const target = e.path ? e.path[0] : e.target;
      if (!target.dataset.sifrrBind) return;
      const value = target.value === undefined ? e.type == 'blur' ? target.innerHTML.trim().replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>').replace(/(&lt;)(input|link|img|br|hr|col|keygen)(((?!&gt;).)*)(&gt;)/g, '<$2$3>') : target.innerHTML : target.value;
      let data = {};
      data[target.dataset.sifrrBind] = value;
      target.getRootNode().host.state = data;
    },
    updateState: function (element) {
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
      let newHTML = Parser.evaluateString(node.data, element);
      if (realHTML == newHTML) return;
      if (!newHTML) newHTML = '';
      if (Array.isArray(newHTML) && newHTML[0] && newHTML[0].nodeType) {
        node.dom.innerHTML = '';
        node.dom.append(...newHTML);
      } else if (newHTML.nodeType) {
        node.dom.innerHTML = '';
        node.dom.appendChild(newHTML);
      } else {
        if (node.dom.contentEditable == 'true' || node.dom.nodeName == 'TEXTAREA' || node.dom.nodeName == 'STYLE' || node.dom.dataset && node.dom.dataset.sifrrHtml == 'true') {
          if (realHTML != newHTML) node.dom.innerHTML = newHTML;
        } else {
          if (realHTML != newHTML) node.dom.childNodes[0].textContent = newHTML;
        }
      }
    },
    updateAttribute: function (attr, element) {
      attr.dom.setAttribute(attr.name, Parser.evaluateString(attr.value, element));
    },
    evaluateString: function (string, element) {
      if (string.indexOf('${') < 0) return string;
      string = string.trim();
      return string.replace(/\${([^{}$]|{([^{}$])*})*}/g, replacer);
      function replacer(match) {
        let g1 = match.slice(2, -1);
        function executeCode() {
          let f;
          if (g1.search('return') >= 0) {
            f = new Function(g1).bind(element);
          } else {
            f = new Function('return ' + g1).bind(element);
          }
          try {
            return f();
          } catch (e) {
            return match;
          }
        }
        return executeCode();
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
            let contentType = resp.headers.get('content-type'),
                result;
            if (contentType && contentType.includes('application/json')) {
              result = resp.json();
            } else {
              result = resp.text();
            }
            if (resp.ok) {
              return result;
            } else {
              let error = Error(resp.statusText);
              error.response = result;
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
      this.constructor.add(elemName, this);
    }
    get template() {
      return this.html.then(file => file.querySelector('template'));
    }
    get html() {
      this._html = this._html || sifrr_fetch.file(this.templateUrl).then(file => new window.DOMParser().parseFromString(file, 'text/html'));
      return this._html;
    }
    get templateUrl() {
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
      this._template = this._template || new loader(this.elementName).template;
      return this._template;
    }
    static get elementName() {
      return this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
    constructor() {
      super();
      let me = this;
      this.constructor.template.then(template => {
        me.attachShadow({
          mode: 'open'
        }).appendChild(template.content.cloneNode(true));
        me.stateMap = parser.createStateMap(me.shadowRoot);
        me.shadowRoot.addEventListener('change', parser.twoWayBind);
        parser.updateState(this);
      });
      this._state = this.constructor.defaultState || {};
      this.tag = this.constructor.elementName;
    }
    connectedCallback() {
      this.state = json.parse(this.dataset.sifrrState) || {};
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
      this._lastState = Object.assign({}, this.state);
      Object.assign(this._state, v);
      parser.updateState(this);
    }
    isSifrr(name = null) {
      if (name) return name == this.constructor.elementName;else return true;
    }
    clearState() {
      this._lastState = this.state;
      this._state = {};
      parser.updateState(this);
    }
  }
  var element = Element;

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
  SifrrDOM.setup = function () {
    class SifrrNode extends HTMLElement {
      static get elementName() {
        return 'sifrr-node';
      }
      connectedCallback() {
        this.style.whiteSpace = 'pre';
      }
    }
    SifrrDOM.register(SifrrNode);
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
