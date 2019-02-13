/*! Sifrr.Dom v0.0.2-alpha - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
import fetch from '@sifrr/fetch';

const Json = {
  parse: (data) => {
    let ans = {};
    if (typeof data == 'string') {
      try {
        ans = JSON.parse(data);
      } catch(e) {
        return data;
      }
      return Json.parse(ans);
    } else if (Array.isArray(data)) {
      ans = [];
      data.forEach((v, i) => {
        ans[i] = Json.parse(v);
      });
    } else if (typeof data == 'object') {
      for (const k in data) {
        ans[k] = Json.parse(data[k]);
      }
    } else {
      return data;
    }
    return ans;
  },
  stringify: (data) => {
    if (typeof data == 'string') {
      return data;
    } else {
      return JSON.stringify(data);
    }
  },
  shallowEqual: (a, b) => {
    for(let key in a) {
      if(!(key in b) || a[key] != b[key]) {
        return false;
      }
    }
    for(let key in b) {
      if(!(key in a) || a[key] != b[key]) {
        return false;
      }
    }
    return true;
  },
  deepClone: (json) => {
    if (Array.isArray(json)) return json.map((i) => Json.deepClone(i));
    if (typeof json !== 'object' || json === null) return json;
    let clone = {};
    for (let key in json) {
      clone[key] = Json.deepClone(json[key]);
    }
    return clone;
  }
};
var json = Json;

const TREE_WALKER = window.document.createTreeWalker(window.document, window.NodeFilter.SHOW_ALL, null, false);
TREE_WALKER.nextNonfilterNode = function(fxn) {
  let node = this.currentNode;
  if (fxn && fxn(node)){
    node = this.nextSibling() || (this.parentNode(), this.nextSibling());
  } else node = this.nextNode();
  return node;
};
TREE_WALKER.roll = function(n, filter) {
  let node = this.currentNode;
  while(--n) {
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
  const refs = [];
  TREE_WALKER.currentNode = element;
  stateMap.map(x => refs.push(TREE_WALKER.roll(x.idx, filter)));
  return refs;
}
function create(node, fxn, filter = false) {
  let indices = [], ref, idx = 0;
  TREE_WALKER.currentNode = node;
  while(node) {
    if (ref = fxn(node)) {
      indices.push(new Ref(idx+1, ref));
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
var constants = {
  TEMPLATE: () => temp.cloneNode(false),
  SCRIPT: () => script.cloneNode(false),
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  ELEMENT_NODE: 1
};

const { collect: collect$1, create: create$1 } = ref;
const { TEXT_NODE, COMMENT_NODE, ELEMENT_NODE } = constants;
function isHtml(el) {
  return (el.dataset && el.dataset.sifrrHtml == 'true') ||
    el.contentEditable == 'true' ||
    el.nodeName == 'TEXTAREA' ||
    el.nodeName == 'STYLE' ||
    (el.dataset && el.dataset.sifrrRepeat);
}
function creator(el) {
  if (el.nodeType === TEXT_NODE || el.nodeType === COMMENT_NODE) {
    const x = el.data;
    if (x.indexOf('${') > -1) return {
      html: false,
      text: x
    };
  } else if (el.nodeType === ELEMENT_NODE) {
    const sm = {};
    if (isHtml(el)) {
      const innerHTML = el.innerHTML;
      if (innerHTML.indexOf('${') >= 0) {
        sm.html = true;
        sm.text = innerHTML.replace(/<!--(.*)-->/g, '$1');
      }
    }
    const attrs = el.attributes, l = attrs.length;
    const attrStateMap = { events: {} };
    for (let i = 0; i < l; i++) {
      const attribute = attrs[i];
      if (attribute.name[0] === '$') {
        attrStateMap.events[attribute.name] = attribute.value;
      } else if (attribute.value.indexOf('${') >= 0) {
        if (attribute.name === 'style') {
          const styles = {};
          attribute.value.split(';').forEach((s) => {
            const [n, v] = s.split(/:(?!\/\/)/);
            if (n && v && v.indexOf('${') >= 0) {
              styles[n.trim()] = v.trim();
            }
          });
          attrStateMap[attribute.name] = styles;
        } else {
          attrStateMap[attribute.name] = attribute.value;
        }
      }
    }
    if (Object.keys(attrStateMap.events).length === 0) delete attrStateMap.events;
    if (Object.keys(attrStateMap).length > 0) sm.attributes = attrStateMap;
    if (Object.keys(sm).length > 0) return sm;
  }
  return 0;
}
const Parser = {
  collectRefs: (el, stateMap) => collect$1(el, stateMap, isHtml),
  createStateMap: (element) => create$1(element, creator, isHtml),
  twoWayBind: (e) => {
    const target = e.path ? e.path[0] : e.target;
    if (!target.dataset.sifrrBind) return;
    const value = target.value === undefined ? target.innerHTML : target.value;
    let state = {};
    let root;
    if (target._root) {
      root = target._root;
    } else {
      root = target;
      while(!root.isSifrr) root = root.parentNode || root.host;
      target._root = root;
    }
    state[target.dataset.sifrrBind] = value;
    root.state = state;
  },
  evaluateString: (string, element) => {
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

var updateattribute = (element, name, newValue) => {
  const fromValue = element.getAttribute(name);
  if (fromValue != newValue) {
    if (newValue == 'null' || newValue == 'undefined' || newValue == 'false' || !newValue) {
      if (fromValue) element.removeAttribute(name);
    } else {
      element.setAttribute(name, newValue);
    }
  }
  if (name == 'value' && (element.nodeName == 'SELECT' || element.nodeName == 'INPUT')) element.value = newValue;
};

const { shallowEqual } = json;
const { TEXT_NODE: TEXT_NODE$1, COMMENT_NODE: COMMENT_NODE$1 } = constants;
function makeChildrenEqual(parent, newChildren) {
  const oldL = parent.childNodes.length, newL = newChildren.length;
  if (oldL > newL) {
    let i = oldL;
    while(i > newL) {
      parent.removeChild(parent.lastChild);
      i--;
    }
  } else if (oldL < newL) {
    let i = oldL;
    while(i < newL) {
      parent.appendChild(newChildren[i]);
      i++;
    }
  }
  const l = Math.min(newL, oldL);
  for(let i = 0, item, head = parent.firstChild; i < l; i++) {
    item = newChildren[i];
    head = makeEqual(head, item).nextSibling;
  }
}
function makeEqual(oldNode, newNode) {
  if (newNode === null) return oldNode;
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
  let oldAttrs = oldNode.attributes, newAttrs = newNode.attributes, attr;
  for (let i = newAttrs.length - 1; i >= 0; --i) {
    updateattribute(oldNode, newAttrs[i].name, newAttrs[i].value);
  }
  for (let j = oldAttrs.length - 1; j >= 0; --j) {
    attr = oldAttrs[j];
    if (!newNode.hasAttribute(attr.name) && attr.specified !== false) oldNode.removeAttribute(attr.name);
  }
  makeChildrenEqual(oldNode, newNode.childNodes);
  return oldNode;
}
var makeequal = {
  makeEqual,
  makeChildrenEqual
};

const { makeChildrenEqual: makeChildrenEqual$1 } = makeequal;
const { evaluateString } = parser;
const TEMPLATE = constants.TEMPLATE();
var update = (element) => {
  if (!element._refs) {
    return false;
  }
  const l = element._refs.length;
  for (let i = 0; i < l; i++) {
    const data = element.constructor.stateMap[i].ref;
    const dom = element._refs[i];
    if (data.attributes) {
      for(let key in data.attributes) {
        if (key === 'events') {
          for(let event in data.attributes.events) {
            const eventLis = evaluateString(data.attributes.events[event], element, true);
            if (data.attributes.events[event].slice(0, 6) === '${this') {
              dom[event] = eventLis.bind(element);
            } else {
              dom[event] = eventLis;
            }
          }
        } else if (key === 'style') {
          for (let k in data.attributes.style) {
            dom.style[k] = evaluateString(data.attributes.style[k], element);
          }
        } else {
          const val = evaluateString(data.attributes[key], element);
          updateattribute(dom, key, val);
        }
      }
    }
    if (data.html === undefined) continue;
    const newValue = evaluateString(data.text, element);
    if (!newValue) { dom.textContent = ''; continue; }
    if (data.html) {
      let children;
      if (Array.isArray(newValue)) {
        children = newValue;
      } else if (newValue.nodeType === 1) {
        children = Array.prototype.slice.call(newValue.content.childNodes);
      } else if (newValue.nodeType) {
        children = [newValue];
      } else {
        TEMPLATE.innerHTML = newValue.toString()
          .replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>')
          .replace(/(&lt;)(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)(((?!&gt;).)*)(&gt;)/g, '<$2$3>');
        children = Array.prototype.slice.call(TEMPLATE.content.childNodes);
      }
      makeChildrenEqual$1(dom, children);
    } else {
      if (dom.data != newValue) {
        dom.data = newValue || '';
      }
    }
  }
  element.onUpdate();
};

const { TEMPLATE: TEMPLATE$1 } = constants;
var template = (str, ...extra) => {
  const tmp = TEMPLATE$1();
  if (typeof str === 'string') ; else if (str[0] && typeof str[0] === 'string') {
    str = String.raw(str, ...extra);
  } else if (str[0]) {
    Array.from(str).forEach((s) => {
      tmp.content.appendChild(s);
    });
    return tmp;
  } else {
    return str;
  }
  str = str
    .replace(/>\n+/g, '>')
    .replace(/\s+</g, '<')
    .replace(/>\s+/g, '>')
    .replace(/(\\)?\$(\\)?\{/g, '${');
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
    this._html = fetch.file(this.htmlUrl)
      .then((resp) => resp.text())
      .then((file) => template(file).content).then((content) => {
        me.template = content.querySelector('template');
        return content;
      });
    return this._html;
  }
  get js() {
    if (this._js) return this._js;
    Loader.add(this.elementName, this);
    this._js = fetch.file(this.jsUrl)
      .then((resp) => resp.text());
    return this._js;
  }
  get htmlUrl() {
    return this.url || `${window.Sifrr.Dom.config.baseUrl + '/'}elements/${this.elementName.split('-').join('/')}.html`;
  }
  get jsUrl() {
    return this.url || `${window.Sifrr.Dom.config.baseUrl + '/'}elements/${this.elementName.split('-').join('/')}.js`;
  }
  executeScripts(js) {
    if (this._executed) return window.console.log(`${this.elementName} was already executed`);
    this._executed = true;
    if (!js) {
      return this.executeHTMLScripts();
    } else {
      return this.js.then((script) => {
        new Function(script).bind(window)();
      }).catch((e) => {
        window.console.error(e);
        window.console.log(`JS file gave error. Trying to get html file for ${this.elementName}.`);
        return this.executeHTMLScripts();
      });
    }
  }
  executeHTMLScripts() {
    return this.html.then((file) => {
      file.querySelectorAll('script').forEach((script) => {
        if (script.src) {
          const newScript = constants.SCRIPT();
          newScript.src = script.src;
          newScript.type = script.type;
          window.document.body.appendChild(newScript);
        } else {
          new Function(script.text).call(window);
        }
      });
    }).catch(e => window.console.error(e));
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

const { collect: collect$2, create: create$2 } = ref;
const { ELEMENT_NODE: ELEMENT_NODE$1 } = constants;
function creator$1(node) {
  if (node.nodeType === ELEMENT_NODE$1) {
    if (node.attributes !== undefined) {
      const attrs = Array.from(node.attributes), l = attrs.length;
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
    }
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
function updateState(simpleEl) {
  const doms = simpleEl._refs, refs = simpleEl.stateMap, l = refs.length;
  const newState = simpleEl.state, oldState = simpleEl._oldState;
  for (let i = 0; i < l; i++) {
    const data = refs[i].ref, dom = doms[i];
    if (Array.isArray(data)) {
      const l = data.length;
      for (let i = 0; i < l; i++) {
        const attr = data[i];
        if (oldState[attr.text] !== newState[attr.text]) {
          if (attr.name === 'class') dom.className = newState[attr.text];
          else dom.setAttribute(attr.name, newState[attr.text]);
        }
      }
    } else {
      if (oldState[data] != newState[data]) dom.data = newState[data];
    }
  }
}
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
    (content.getAttribute && content.getAttribute('is') && content.getAttribute('is').indexOf('-') >= 0)
  ) {
    window.document.body.appendChild(content);
    content.remove();
    return content;
  }
  content.stateMap = create$2(content, creator$1);
  content._refs = collect$2(content, content.stateMap);
  Object.defineProperty(content, 'state', {
    get: () => content._state,
    set: (v) => {
      content._oldState = Object.assign({}, content._state);
      content._state = Object.assign(content._state || {}, v);
      updateState(content);
    }
  });
  if (defaultState) content.state = defaultState;
  content.sifrrClone = function(deep = true) {
    const clone = content.cloneNode(deep);
    clone.stateMap = content.stateMap;
    clone._refs = collect$2(clone, content.stateMap);
    Object.defineProperty(clone, 'state', {
      get: () => clone._state,
      set: (v) => {
        clone._oldState = Object.assign({}, clone._state);
        clone._state = Object.assign(clone._state || {}, v);
        updateState(clone);
      }
    });
    if (content.state) clone.state = content.state;
    return clone;
  };
  return content;
}
var simpleelement = SimpleElement;

const SYNTHETIC_EVENTS = {};
const opts = { capture: true, passive: true };
const nativeToSyntheticEvent = (e, name) => {
  return Promise.resolve((() => {
    const target = e.composedPath ? e.composedPath()[0] : e.target;
    let dom = target;
    while(dom) {
      const eventHandler = dom[`$${name}`];
      if (eventHandler) {
        eventHandler(e, target);
      }
      cssMatchEvent(e, name, dom, target);
      dom = dom.parentNode || dom.host;
    }
  })());
};
const cssMatchEvent = (e, name, dom, target) => {
  function callEach(fxns) {
    fxns.forEach((fxn) => fxn(e, target, dom));
  }
  for (let css in SYNTHETIC_EVENTS[name]) {
    if ((typeof dom.matches === 'function' && dom.matches(css)) ||
      (dom.nodeType === 9 && css === 'document')) callEach(SYNTHETIC_EVENTS[name][css]);
  }
};
const Event = {
  all: SYNTHETIC_EVENTS,
  add: (name) => {
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
    const fxns = SYNTHETIC_EVENTS[name][css] || [], i = fxns.indexOf(fxn);
    if (i >= 0) fxns.splice(i, 1);
    SYNTHETIC_EVENTS[name][css] = fxns;
    return true;
  },
  trigger: (el, name, options) => {
    if (typeof el === 'string') el = document.querySelector(el);
    el.dispatchEvent(new window.Event(name, Object.assign({ bubbles: true, composed: true }, options)));
  },
  opts: opts
};
var event = Event;

const { opts: opts$1 } = event;
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
      return (loader.all[this.elementName] || { template: false }).template;
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
        if (this.constructor.useShadowRoot) {
          this._refs = parser.collectRefs(content, this.constructor.stateMap);
          this.attachShadow({
            mode: 'open'
          });
          this.shadowRoot.appendChild(content);
          this.shadowRoot.addEventListener('change', parser.twoWayBind, opts$1);
        } else {
          this.__content = content;
        }
      }
    }
    connectedCallback() {
      if(!this.constructor.useShadowRoot) {
        this.textContent = '';
        this._refs = parser.collectRefs(this.__content, this.constructor.stateMap);
        this.appendChild(this.__content);
      }
      if (!this.hasAttribute('data-sifrr-state') || !this.constructor.useShadowRoot) this.update();
      this.onConnect();
    }
    onConnect() {}
    disconnectedCallback() {
      if (this.shadowRoot) this.shadowRoot.removeEventListener('change', parser.twoWayBind, opts$1);
      this.onDisconnect();
    }
    onDisconnect() {}
    attributeChangedCallback(attrName, oldVal, newVal) {
      if (attrName === 'data-sifrr-state') {
        this.state = json.parse(newVal);
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
      update(this);
    }
    onUpdate() {}
    isSifrr(name = null) {
      if (name) return name === this.constructor.elementName;
      else return true;
    }
    sifrrClone(deep) {
      return this.cloneNode(deep);
    }
    clearState() {
      this._state = {};
      this.update();
    }
    $(args, sr = true) {
      if (this.constructor.useShadowRoot && sr) return this.shadowRoot.querySelector(args);
      else return this.querySelector(args);
    }
    $$(args, sr = true) {
      if (this.constructor.useShadowRoot && sr) return this.shadowRoot.querySelectorAll(args);
      else return this.querySelectorAll(args);
    }
    static addArrayToDom(key, template) {
      this._arrayToDom = this._arrayToDom || {};
      this._arrayToDom[this.elementName] = this._arrayToDom[this.elementName] || {};
      this._arrayToDom[this.elementName][key] = simpleelement(template);
    }
    arrayToDom(key, newState = this.state[key]) {
      this._domL = this._domL || {};
      const oldL = this._domL[key] || 0;
      const domArray = [];
      const newL = newState.length;
      let temp;
      try {
        temp = this.constructor._arrayToDom[this.constructor.elementName][key];
        if (!temp) throw Error('');
      } catch(e) {
        return window.console.error(`[error]: No arrayToDom data of '${key}' added in ${this.constructor.elementName}.`);
      }
      for (let i = 0; i < newL; i++) {
        if (i < oldL) {
          domArray.push({ type: 'stateChange', state: newState[i] });
        } else {
          const el = temp.sifrrClone(true);
          el.state = newState[i];
          domArray.push(el);
        }
      }
      this._domL[key] = newL;
      return domArray;
    }
  };
}
var element = elementClassFactory(window.HTMLElement);

let SifrrDom = {};
SifrrDom.elements = {};
SifrrDom.loadingElements = [];
SifrrDom.Element = element;
SifrrDom.Parser = parser;
SifrrDom.Loader = loader;
SifrrDom.SimpleElement = simpleelement;
SifrrDom.Event = event;
SifrrDom.makeEqual = makeequal;
SifrrDom.Json = json;
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
SifrrDom.setup = function(config) {
  SifrrDom.config = Object.assign({
    baseUrl: '',
    useShadowRoot: true
  }, config);
  if (typeof SifrrDom.config.baseUrl !== 'string') throw Error('baseUrl should be a string');
  SifrrDom.Event.add('input');
  SifrrDom.Event.add('change');
  SifrrDom.Event.addListener('change', 'document', SifrrDom.Parser.twoWayBind);
  SifrrDom.Event.addListener('input', 'document', SifrrDom.Parser.twoWayBind);
};
SifrrDom.load = function(elemName, { url, js = true } = {}) {
  let loader$$1 = new SifrrDom.Loader(elemName, url);
  SifrrDom.loadingElements.push(customElements.whenDefined(elemName));
  return loader$$1.executeScripts(js);
};
SifrrDom.loading = () => {
  return Promise.all(SifrrDom.loadingElements);
};
var sifrr_dom = SifrrDom;

export default sifrr_dom;
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.dom.module.js.map
