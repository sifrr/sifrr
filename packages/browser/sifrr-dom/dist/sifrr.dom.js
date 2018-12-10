(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Sifrr = global.Sifrr || {}, global.Sifrr.Dom = factory());
}(this, (function () { 'use strict';

  class Vdom {
    static toVDOM(html, dom = false, state = false) {
      if (NodeList.prototype.isPrototypeOf(html) || Array.isArray(html)) {
        let ans = [];
        html.forEach(v => ans.push(SFComponent.toVDOM(v, dom, state)));
        return ans;
      } else if (html.nodeType === 3 || typeof html === 'string') {
        const x = html.nodeValue || html;
        return {
          tag: '#text',
          data: x,
          state: x.indexOf('${') > -1 || state
        };
      } else {
        let nstate = false;
        const attrs = html.attributes || {},
              l = attrs.length,
              attr = [];
        for (let i = 0; i < l; i++) {
          attr[attrs[i].name] = {
            value: attrs[i].value,
            state: attrs[i].value.indexOf('${') > -1 || state
          };
          if (attr[attrs[i].name].state) nstate = true;
        }
        let ans = {
          tag: html.nodeName,
          attrs: attr,
          children: SFComponent.toVDOM(html.childNodes, dom, state)
        };
        if (dom) ans.dom = html;
        ans.children.forEach(c => {
          if (c.state) nstate = true;
        });
        ans.state = state || nstate;
        return ans;
      }
    }
    static twoWayBind(e) {
      const target = e.composedPath() ? e.composedPath()[0] : e.target;
      target.setAttribute("value", target.value);
      if (!target.dataset || !target.dataset.bindTo) {
        return;
      }
      let host = target.getRootNode();
      let sr = host,
          range,
          startN,
          startO,
          endN,
          endO;
      if (!target.value) {
        range = sr.getSelection().getRangeAt(0).cloneRange();
        [startN, startO, endN, endO] = [range.startContainer, range.startOffset, range.endContainer, range.endOffset];
      }
      host = host.host;
      let data = {};
      data[target.dataset.bindTo] = typeof target.value === 'string' ? target.value : target.innerHTML.trim().replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>').replace(/(&lt;)(input|link|img|br|hr|col|keygen)(((?!&gt;).)*)(&gt;)/g, '<$2$3>');
      host.state = data;
      if (!target.value) {
        range.setStart(startN, startO);
        range.setEnd(endN, endO);
        sr.getSelection().removeAllRanges();
        sr.getSelection().addRange(range);
      }
    }
    static updateState(element) {
    }
  }
  var vdom = Vdom;

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

  class Element extends window.HTMLElement {
    static get observedAttributes() {
      return ['data-sifrr-state'].concat(this.observedAttrs || []);
    }
    static get template() {
      this._template = this._template || this.getTemplate();
      return this._template;
    }
    static get templateUrl() {
      return `/elements/${this.elementName.split('-').join('/')}.html`;
    }
    static get elementName() {
      return this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
    static getTemplate() {
      return sifrr_fetch.file(this.templateUrl);
    }
    constructor() {
      super();
      let me = this;
      this.constructor.template.then(template => {
        me.attachShadow({
          mode: 'open'
        }).appendChild(template.content.cloneNode(true));
        me.vdom = vdom.toVDOM(template.content.cloneNode(true));
      });
      this._state = this.constructor.defaultState || {};
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
      if (attrName === 'data-sifrr-state') {
        this.state = json.parse(newVal);
      }
    }
    connectedCallback() {
      this.state = json.parse(this.dataset.sifrrState) || {};
      if (this.shadowRoot) this.shadowRoot.addEventListener('change', vdom.twoWayBind);else this.addEventListener('change', vdom.twoWayBind);
    }
    disconnectedCallback() {}
    clone(deep = true) {
      let ret = this.cloneNode(deep);
      ret.state = this.state;
      return ret;
    }
    get state() {
      return this._state || {};
    }
    set state(v) {
      this._lastState = this.state;
      Object.assign(this._state, v);
      vdom.updateState(this);
    }
    isSifrr(name = null) {
      if (name) return name == this.constructor.elementName;else return true;
    }
    clearState() {
      this._state = {};
      vdom.updateState(this);
    }
  }
  var element = Element;

  let SifrrDOM = {};
  SifrrDOM.elements = {};
  SifrrDOM.Element = element;
  SifrrDOM.register = function (Element) {
    const name = Element.elementName;
    if (!name) {
      console.log('Error creating Custom Element: No name given.');
    } else if (window.customElements.get(name)) {
      console.log(`Error creating Element: ${name} - Custom Element with this name is already defined.`);
    } else if (name.indexOf('-') < 1) {
      console.log(`Error creating Element: ${name} - Custom Element name must have one dash '-'`);
    } else {
      try {
        window.customElements.define(name, Element);
        SifrrDOM.elements[name] = Element;
        return true;
      } catch (error) {
        console.log(`Error creating Custom Element: ${name} - ${error}`);
        return false;
      }
    }
    return false;
  };
  var sifrr_dom = SifrrDOM;

  return sifrr_dom;

})));
