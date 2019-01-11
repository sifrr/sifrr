/*! Sifrr.Dom v0.0.2-alpha - sifrr project */
import fetch from '@sifrr/fetch';

const URLExt = {
  absolute: (base, relative) => {
    let stack = base.split('/'),
        parts = relative.split('/');
    stack.pop();

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] == '.') continue;
      if (parts[i] == '..') stack.pop();else stack.push(parts[i]);
    }

    return stack.join('/');
  },
  getRoutes: url => {
    if (url[0] != '/') {
      url = '/' + url;
    }

    let qIndex = url.indexOf('?');

    if (qIndex != -1) {
      url = url.substring(0, qIndex);
    }

    return url.split('/');
  }
};
var url = URLExt;

const Json = {
  parse: data => {
    let ans = {};

    if (typeof data == 'string') {
      try {
        ans = JSON.parse(data);
      } catch (e) {
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
  stringify: data => {
    if (typeof data == 'string') {
      return data;
    } else {
      return JSON.stringify(data);
    }
  },
  shallowEqual: (a, b) => {
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
  },
  deepClone: json => {
    if (Array.isArray(json)) return json.map(i => Json.deepClone(i));
    if (typeof json !== 'object' || json === null) return json;
    let clone = {};

    for (let key in json) {
      clone[key] = Json.deepClone(json[key]);
    }

    return clone;
  }
};
var json = Json;

const temp = window.document.createElement('template');
const sfn = window.document.createElement('sifrr-node');
var constants = {
  SIFRR_NODE: () => sfn.cloneNode(),
  TEMPLATE: () => temp.cloneNode(),
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  ELEMENT_NODE: 1
};

// Attribute related gotchas
function updateAttribute(element, name, newValue) {
  if (name === 'class') {
    const fromValue = element.className;

    if (fromValue != newValue) {
      // values are always cast to strings
      if (newValue == 'null' || newValue == 'undefined' || newValue == 'false' || !newValue) {
        element.className = '';
      } else {
        element.className = newValue;
      }
    }
  } else {
    const fromValue = element.getAttribute(name);

    if (fromValue != newValue) {
      // values are always cast to strings
      if (newValue == 'null' || newValue == 'undefined' || newValue == 'false' || !newValue) {
        if (fromValue) element.removeAttribute(name);
      } else {
        element.setAttribute(name, newValue);
      }
    } // select/input's value doesn't change on changing value attribute


    if ((element.nodeName == 'SELECT' || element.nodeName == 'INPUT') && name == 'value') element.value = newValue;
  }
}

var update = {
  updateAttribute
};

const {
  updateAttribute: updateAttribute$1
} = update;
const {
  shallowEqual
} = json;
const {
  TEXT_NODE,
  COMMENT_NODE
} = constants; // Inspired from https://github.com/Freak613/stage0/blob/master/reuseNodes.js

function makeChildrenEqual(parent, newChildren) {
  // Lesser children now
  const oldL = parent.childNodes.length,
        newL = newChildren.length;

  if (oldL > newL) {
    let i = oldL;

    while (i > newL) {
      parent.removeChild(parent.lastChild);
      i--;
    } // More Children now

  } else if (oldL < newL) {
    let i = oldL;

    while (i < newL) {
      parent.appendChild(newChildren[i]);
      i++;
    }
  }

  const l = Math.min(newL, oldL); // Make old children equal to new children

  for (let i = 0, item, head = parent.firstChild; i < l; i++) {
    item = newChildren[i]; // make two nodes equal

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

  if (oldNode.nodeType === TEXT_NODE || oldNode.nodeType === COMMENT_NODE) {
    if (oldNode.data !== newNode.data) oldNode.data = newNode.data;
    return oldNode;
  } // copy sifrr state


  if (newNode.state) oldNode.state = newNode.state; // copy Attributes

  let oldAttrs = oldNode.attributes,
      newAttrs = newNode.attributes,
      attr;

  for (let i = newAttrs.length - 1; i >= 0; --i) {
    updateAttribute$1(oldNode, newAttrs[i].name, newAttrs[i].value);
  } // Remove any extra attributes


  for (let j = oldAttrs.length - 1; j >= 0; --j) {
    attr = oldAttrs[j];
    if (!newNode.hasAttribute(attr.name) && attr.specified !== false) oldNode.removeAttribute(attr.name);
  } // make children equal


  makeChildrenEqual(oldNode, newNode.childNodes);
  return oldNode;
}

var makeequal = {
  makeEqual,
  makeChildrenEqual
};

// based on https://github.com/Freak613/stage0/blob/master/index.js
const TREE_WALKER = window.document.createTreeWalker(window.document, window.NodeFilter.SHOW_ALL, null, false);

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
  collect,
  create,
  Ref
};

const {
  makeChildrenEqual: makeChildrenEqual$1
} = makeequal;
const {
  updateAttribute: updateAttribute$2
} = update;
const {
  collect: collect$1,
  create: create$1
} = ref;
const {
  TEXT_NODE: TEXT_NODE$1,
  COMMENT_NODE: COMMENT_NODE$1,
  ELEMENT_NODE
} = constants;
const TEMPLATE = constants.TEMPLATE();

function isHtml(el) {
  return el.dataset && el.dataset.sifrrHtml == 'true' || el.contentEditable == 'true' || el.nodeName == 'TEXTAREA' || el.nodeName == 'STYLE' || el.dataset && el.dataset.sifrrRepeat;
}

function creator(el) {
  if (el.nodeType === TEXT_NODE$1 || el.nodeType === COMMENT_NODE$1) {
    // text node
    const x = el.nodeValue;
    if (x.indexOf('${') > -1) return {
      html: false,
      text: x.trim()
    };
  } else if (el.nodeType === ELEMENT_NODE) {
    const sm = {}; // Html ?

    if (isHtml(el)) {
      const innerHTML = el.innerHTML;

      if (innerHTML.indexOf('${') >= 0) {
        sm.html = true;
        sm.text = innerHTML.replace(/<!--(.*)-->/g, '$1');
      }
    } // attributes


    const attrs = el.attributes || [],
          l = attrs.length;
    const attrStateMap = {
      events: {}
    };

    for (let i = 0; i < l; i++) {
      const attribute = attrs[i];

      if (attribute.name[0] === '$') {
        attrStateMap.events[attribute.name] = attribute.value;
      } else if (attribute.value.indexOf('${') >= 0) {
        attrStateMap[attribute.name] = attribute.value;
      }
    }

    if (Object.keys(attrStateMap).length > 0) sm.attributes = attrStateMap;
    if (Object.keys(sm).length > 0) return sm;
  }

  return 0;
}

const Parser = {
  collectRefs: (el, stateMap) => collect$1(el, stateMap, isHtml),
  createStateMap: element => create$1(element, creator, isHtml),
  update: element => {
    if (!element._refs) {
      return false;
    } // Update nodes


    const l = element._refs.length;

    for (let i = 0; i < l; i++) {
      const data = element.constructor.stateMap[i].ref;
      const dom = element._refs[i]; // update attributes

      if (data.attributes) {
        for (let key in data.attributes) {
          if (key === 'events') {
            for (let event in data.attributes.events) {
              dom[event] = Parser.evaluateString(data.attributes.events[event], element);
            }
          } else {
            const val = Parser.evaluateString(data.attributes[key], element);
            updateAttribute$2(dom, key, val);
          }
        }
      }

      if (data.html === undefined) continue; // update element

      const newValue = Parser.evaluateString(data.text, element);

      if (!newValue) {
        dom.textContent = '';
        continue;
      }

      if (data.html) {
        // html node
        let children;

        if (Array.isArray(newValue)) {
          children = newValue;
        } else if (newValue.nodeType) {
          children = [newValue];
        } else {
          // Replace html tags in input from input/contenteditable/textarea
          TEMPLATE.innerHTML = newValue.toString() // All closing tags
          .replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>') // Self closing tags (void elements) from https://html.spec.whatwg.org/multipage/syntax.html#void-elements
          .replace(/(&lt;)(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)(((?!&gt;).)*)(&gt;)/g, '<$2$3>');
          children = Array.prototype.slice.call(TEMPLATE.content.childNodes);
        }

        if (children.length < 1) dom.textContent = '';else makeChildrenEqual$1(dom, children);
      } else {
        // text node
        if (dom.nodeValue != newValue) {
          dom.nodeValue = newValue;
        }
      }
    }
  },
  twoWayBind: e => {
    const target = e.path ? e.path[0] : e.target;
    if (!target.dataset.sifrrBind) return;
    const value = target.value === undefined ? target.innerHTML : target.value;
    let state = {};
    let root;

    if (target._root) {
      root = target._root;
    } else {
      root = target;

      while (!root.isSifrr) root = root.parentNode || root.host;

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

const TEMPLATE$1 = constants.TEMPLATE();

class Loader {
  constructor(elemName, config = {}) {
    if (!fetch) throw Error('Sifrr.Dom.load requires Sifrr.Fetch to work.');
    if (this.constructor.all[elemName]) return this.constructor.all[elemName].instance;
    this.elementName = elemName;
    this.config = config;
    this.constructor.urls[elemName] = this.htmlUrl;
  }

  get html() {
    const me = this;
    if (this.constructor.all[this.elementName] && this.constructor.all[this.elementName].html) return this.constructor.all[this.elementName].html;
    const html = fetch.file(this.htmlUrl).then(resp => resp.text()).then(file => {
      TEMPLATE$1.innerHTML = file;
      return TEMPLATE$1.content;
    }).then(html => {
      Loader._all[me.elementName].template = html.querySelector('template');
      return html;
    });
    Loader.add(me.elementName, {
      instance: me,
      html: html
    });
    return html;
  }

  get js() {
    const me = this;
    if (this.constructor.all[this.elementName] && this.constructor.all[this.elementName].js) return this.constructor.all[this.elementName].js;
    const js = fetch.file(this.jsUrl).then(resp => resp.text());
    Loader.add(me.elementName, {
      instance: me,
      js: js
    });
    return js;
  }

  get htmlUrl() {
    return this.config.url || `${this.config.baseUrl || ''}/elements/${this.elementName.split('-').join('/')}.html`;
  }

  get jsUrl() {
    return this.config.url || `${this.config.baseUrl || ''}/elements/${this.elementName.split('-').join('/')}.js`;
  }

  executeScripts() {
    return this.html.then(file => {
      file.querySelectorAll('script').forEach(script => {
        if (script.hasAttribute('src')) {
          window.document.body.appendChild(script);
        } else {
          new Function(script.text).bind(window)();
        }
      });
    }).catch(e => {
      window.console.warn(e);
      window.console.log('Trying to get js file.');
      this.js.then(script => {
        new Function(script).bind(window)();
      });
    });
  }

  static add(elemName, instance) {
    Loader._all[elemName] = Object.assign(Loader._all[elemName] || {}, instance);
  }

  static get all() {
    return Loader._all;
  }

}

Loader._all = {};
Loader.urls = {};
var loader = Loader;

const {
  collect: collect$2,
  create: create$2
} = ref;
const TEMPLATE$2 = constants.TEMPLATE(); // Inspired from https://github.com/Freak613/stage0/blob/master/index.js

function creator$1(node) {
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

        if (oldState[attr.text] !== newState[attr.text]) {
          if (attr.name === 'class') dom.className = newState[attr.text] || '';else dom.setAttribute(attr.name, newState[attr.text]);
        }
      }
    } else {
      if (oldState[data] != newState[data]) dom.nodeValue = newState[data];
    }
  }
}

function SimpleElement(content, defaultState) {
  if (typeof content === 'string') {
    TEMPLATE$2.innerHTML = content;
    content = TEMPLATE$2.content.firstElementChild || TEMPLATE$2.content.firstChild;
    const oldDisplay = content.style.display;
    content.style.display = 'none';
    window.document.body.appendChild(content);
    content.remove();
    content.style.display = oldDisplay;
  }

  if (content.nodeName.indexOf('-') !== -1 || content.getAttribute('is') && content.getAttribute('is').indexOf('-') >= 0 || content.isSifrr && content.isSifrr()) return content;
  content.stateMap = create$2(content, creator$1);
  content._refs = collect$2(content, content.stateMap);
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
    clone._refs = collect$2(clone, content.stateMap);
    Object.defineProperty(clone, 'state', {
      get: () => clone._state,
      set: v => {
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
      return loader.all[this.elementName].template;
    }

    static get ctemp() {
      this._ctemp = this._ctemp || this.template;
      return this._ctemp;
    }

    static get stateMap() {
      this._stateMap = this._stateMap || parser.createStateMap(this.ctemp.content);
      return this._stateMap;
    }

    static get elementName() {
      return this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }

    static onStateChange() {}

    static get useShadowRoot() {
      return this.ctemp.getAttribute('use-shadow-root') !== 'false' && this.useSR;
    }

    constructor() {
      super(); // this._oldState = {};

      if (this.constructor.defaultState || this.state) this._state = Object.assign({}, this.constructor.defaultState, this.state);
      const content = this.constructor.ctemp.content.cloneNode(true);

      if (this.constructor.useShadowRoot) {
        this._refs = parser.collectRefs(content, this.constructor.stateMap);
        this.attachShadow({
          mode: 'open'
        });
        this.shadowRoot.appendChild(content);
        this.shadowRoot.addEventListener('change', parser.twoWayBind);
      } else {
        this.__content = content;
      }
    }

    connectedCallback() {
      if (!this.constructor.useShadowRoot) {
        this.textContent = '';
        this._refs = parser.collectRefs(this.__content, this.constructor.stateMap);
        this.appendChild(this.__content);
        if (this._state || this.hasAttribute('data-sifrr-state')) this.update();
      } else {
        if (!this.hasAttribute('data-sifrr-state') && this._state) this.update();
      }

      this.onConnect();
    }

    onConnect() {}

    disconnectedCallback() {
      if (this.shadowRoot) this.shadowRoot.removeEventListener('change', parser.twoWayBind);
      if (!this.constructor.useShadowRoot) this.textContent = '';
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
      // return JsonExt.deepClone(this._state);
      return this._state;
    }

    set state(v) {
      // this._oldState = this.state;
      this._state = this._state || {};
      Object.assign(this._state, v);
      this.update();
    }

    update() {
      parser.update(this);
      this.onStateChange();
      this.constructor.onStateChange(this);
    }

    onStateChange() {}

    isSifrr(name = null) {
      if (name) return name === this.constructor.elementName;else return true;
    }

    sifrrClone(deep) {
      const clone = this.cloneNode(deep);
      return clone;
    }

    clearState() {
      // this._oldState = this.state;
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
      this._arrayToDom = this._arrayToDom || {}; // state of simple element is single array item, compatible with sifrr element

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
      } catch (e) {
        return window.console.log(`[error]: No arrayToDom data of '${key}' added in ${this.constructor.elementName}.`);
      }

      for (let i = 0; i < newL; i++) {
        if (i < oldL) {
          domArray.push({
            type: 'stateChange',
            state: newState[i]
          });
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

// Taken from https://github.com/Freak6133/stage0/blob/master/syntheticEvents.js
const SYNTHETIC_EVENTS = {};

const nativeToSyntheticEvent = (e, name) => {
  return Promise.resolve((() => {
    let dom = e.path ? e.path[0] : e.target;

    while (dom) {
      const eventHandler = dom[`$${name}`];

      if (eventHandler) {
        eventHandler(e, dom);
      }

      cssMatchEvent(e, name, dom);
      dom = dom.parentNode || dom.host;
    }
  })());
};

const cssMatchEvent = (e, name, dom) => {
  function callEach(fxns) {
    fxns.forEach(fxn => fxn(e, dom));
  }

  for (let css in SYNTHETIC_EVENTS[name]) {
    if (typeof dom.matches === 'function' && dom.matches(css) || dom.nodeType === 9 && css === 'document') callEach(SYNTHETIC_EVENTS[name][css]);
  }
};

const Event = {
  add: name => {
    if (SYNTHETIC_EVENTS[name]) return false;
    window.document.addEventListener(name, event => nativeToSyntheticEvent(event, name), {
      capture: true,
      passive: true
    });
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
    el.dispatchEvent(new window.Event(name, Object.assign({
      bubbles: true,
      composed: true
    }, options)));
  }
};
var event = Event;

const {
  TEMPLATE: TEMPLATE$3
} = constants; // Empty SifrrDom

let SifrrDom = {}; // For elements

SifrrDom.elements = {}; // Classes

SifrrDom.Element = element;
SifrrDom.Parser = parser;
SifrrDom.makeEqual = makeequal;
SifrrDom.Loader = loader;
SifrrDom.SimpleElement = simpleelement;
SifrrDom.Event = event; // HTML to template

SifrrDom.html = (str, ...extra) => {
  const tmp = TEMPLATE$3();

  if (str[0] && typeof str[0] === 'string') {
    str = String.raw(str, ...extra).replace(/{{(.*)}}/g, '${$1}');
    tmp.innerHTML = str;
  } else if (str[0]) {
    Array.from(str).forEach(s => {
      tmp.appendChild(s);
    });
  } else {
    return str;
  }

  return tmp;
}; // Register Custom Element Function


SifrrDom.register = (Element, options) => {
  Element.useSR = SifrrDom.config.useShadowRoot;
  const name = Element.elementName;

  if (!name) {
    window.console.error('Error creating Custom Element: No name given.', Element);
  } else if (window.customElements.get(name)) {
    window.console.warn(`Error creating Element: ${name} - Custom Element with this name is already defined.`);
  } else if (name.indexOf('-') < 1) {
    window.console.error(`Error creating Element: ${name} - Custom Element name must have one dash '-'`);
  } else {
    try {
      window.customElements.define(name, Element, options);
      SifrrDom.elements[name] = Element;
      return true;
    } catch (error) {
      window.console.error(`Error creating Custom Element: ${name} - ${error}`);
      return false;
    }
  }

  return false;
}; // Initialize SifrrDom


SifrrDom.setup = function (config) {
  SifrrDom.config = Object.assign({
    baseUrl: '',
    useShadowRoot: true
  }, config);
  SifrrDom.Event.add('input');
  SifrrDom.Event.add('change');
  SifrrDom.Event.addListener('change', 'document', SifrrDom.Parser.twoWayBind);
  SifrrDom.Event.addListener('input', 'document', SifrrDom.Parser.twoWayBind);
}; // Load Element HTML and execute script in it


SifrrDom.load = function (elemName, config = {
  baseUrl: SifrrDom.config.baseUrl
}) {
  let loader$$1 = new SifrrDom.Loader(elemName, config);
  return loader$$1.executeScripts();
};

SifrrDom.Url = url;
SifrrDom.Json = json; // Relative path to element html

SifrrDom.relativeTo = function (elemName, relativeUrl) {
  if (typeof elemName === 'string') return SifrrDom.Url.absolute(SifrrDom.Loader.urls[elemName], relativeUrl);
};

var sifrr_dom = SifrrDom;

export default sifrr_dom;
/*! (c) @aadityataparia */
