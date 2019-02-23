/*! Sifrr.Dom v0.0.2-alpha - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
import fetch from '@sifrr/fetch';

const temp = window.document.createElement('template');
const script = window.document.createElement('script');
const reg = '(\\${(?:(?:[^{}$]|{(?:[^{}$])*})*)})';
var constants = {
  TEMPLATE: () => temp.cloneNode(false),
  SCRIPT: () => script.cloneNode(false),
  TEXT_NODE: 3,
  COMMENT_NODE: 8,
  ELEMENT_NODE: 1,
  OUTER_REGEX: new RegExp(reg, 'g'),
  HTML_ATTR: 'data-sifrr-html',
  REPEAT_ATTR: 'data-sifrr-repeat',
  KEY_ATTR: 'data-sifrr-key'
};

const TREE_WALKER = window.document.createTreeWalker(window.document, window.NodeFilter.SHOW_ALL, null, false);
const { HTML_ATTR } = constants;
function isHtml(el) {
  return el.hasAttribute && el.hasAttribute(HTML_ATTR);
}
TREE_WALKER.nextNonfilterNode = function(node) {
  if (isHtml(node)){
    node = this.nextSibling() || (this.parentNode(), this.nextSibling());
  } else node = this.nextNode();
  return node;
};
TREE_WALKER.roll = function(n) {
  let node = this.currentNode;
  while(--n) {
    node = this.nextNonfilterNode(node);
  }
  return node;
};
function collect(element, stateMap) {
  const refs = [], l = stateMap.length;
  TREE_WALKER.currentNode = element;
  for (let i = 0; i < l; i++) {
    refs.push(TREE_WALKER.roll(stateMap[i].idx));
  }
  return refs;
}
TREE_WALKER.rollSimple = function(n) {
  let node;
  while(--n) {
    node = this.nextNode();
  }
  return node || this.currentNode;
};
function collectSimple(element, stateMap) {
  const refs = [], l = stateMap.length;
  TREE_WALKER.currentNode = element;
  for (let i = 0; i < l; i++) {
    refs.push(TREE_WALKER.rollSimple(stateMap[i].idx));
  }
  return refs;
}
function create(node, fxn, isSifrrElement = true) {
  let indices = [], ref, idx = 0;
  TREE_WALKER.currentNode = node;
  while(node) {
    if (ref = fxn(node, isHtml, isSifrrElement)) {
      indices.push({ idx: idx+1, ref });
      idx = 1;
    } else {
      idx++;
    }
    node = TREE_WALKER.nextNonfilterNode(node, isSifrrElement);
  }
  return indices;
}
var ref = {
  collect,
  collectSimple,
  create
};

const { TEMPLATE } = constants;
var template = (str, ...extra) => {
  const tmp = TEMPLATE();
  if (typeof str === 'string') ; else if (str[0] && typeof str[0] === 'string') {
    str = String.raw(str, ...extra);
  } else if (str[0]) {
    Array.from(str).forEach((s) => {
      tmp.content.appendChild(s);
    });
    return tmp;
  } else if (str.nodeType && !str.content) {
    tmp.content.appendChild(str);
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

var updateattribute = (element, name, newValue) => {
  const fromValue = element.getAttribute(name);
  if (newValue === false || newValue === null || newValue === undefined) element.removeAttribute(name);
  else if (fromValue !== newValue) {
    if (name === 'class') element.className = newValue;
    else element.setAttribute(name, newValue);
  }
  if (name == 'value' && (element.nodeName == 'SELECT' || element.nodeName == 'INPUT')) element.value = newValue;
};

const Json = {
  shallowEqual: (a, b) => {
    for(let key in a) {
      if(!(key in b) || a[key] !== b[key]) {
        return false;
      }
    }
    for(let key in b) {
      if(!(key in a) || a[key] !== b[key]) {
        return false;
      }
    }
    return true;
  }
};
var json = Json;

const { shallowEqual } = json;
const { TEXT_NODE, COMMENT_NODE } = constants;
function makeChildrenEqual(parent, newChildren, createFn) {
  const oldL = parent.childNodes.length, newL = newChildren.length;
  if (newL === 0) {
    parent.textContent = '';
    return;
  }
  if (oldL === 0) {
    let addition;
    for(let i = 0; i < newL; i++) {
      addition = newChildren[i];
      if (!newChildren[i].nodeType) addition = createFn(newChildren[i]);
      parent.appendChild(addition);
    }
    return;
  }
  if (oldL > newL) {
    let i = oldL;
    while(i > newL) {
      parent.removeChild(parent.lastChild);
      i--;
    }
  } else if (oldL < newL) {
    let i = oldL, addition;
    while(i < newL) {
      addition = newChildren[i];
      if (!newChildren[i].nodeType) addition = createFn(newChildren[i]);
      parent.appendChild(addition);
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
  if (!newNode.nodeType) {
    if (!shallowEqual(oldNode.state, newNode)) {
      oldNode.state = newNode;
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
  }
  if (newNode.state) oldNode.state = newNode.state;
  let oldAttrs = oldNode.attributes, newAttrs = newNode.attributes, attr;
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

const { makeEqual: makeEqual$1 } = makeequal;
function makeChildrenEqualKeyed(parent, newData, createFn = (x) => x, key) {
  const newL = newData.length;
  if (newL === 0) {
    parent.textContent = '';
    return;
  }
  const oldL = parent.childNodes.length;
  if (oldL === 0) {
    for(let i = 0; i < newL; i++) {
      parent.appendChild(createFn(newData[i]));
    }
    return;
  }
  const oldData = []; let _node = parent.firstChild;
  while(_node) {
    oldData.push(_node.state);
    _node = _node.nextSibling;
  }
  let prevStart = 0,
    newStart = 0,
    loop = true,
    prevEnd = oldL - 1, newEnd = newL - 1,
    prevStartNode = parent.firstChild,
    prevEndNode = parent.lastChild,
    finalNode,
    a, b;
  fixes: while(loop) {
    loop = false;
    a = oldData[prevStart], b = newData[newStart];
    while(a[key] === b[key]) {
      makeEqual$1(prevStartNode, b);
      prevStart++;
      prevStartNode = prevStartNode.nextSibling;
      newStart++;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = oldData[prevStart], b = newData[newStart];
    }
    a = oldData[prevEnd], b = newData[newEnd];
    while(a[key] === b[key]) {
      makeEqual$1(prevEndNode, b);
      prevEnd--;
      finalNode = prevEndNode;
      prevEndNode = prevEndNode.previousSibling;
      newEnd--;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = oldData[prevEnd], b = newData[newEnd];
    }
    a = oldData[prevEnd], b = newData[newStart];
    while(a[key] === b[key]) {
      loop = true;
      makeEqual$1(prevEndNode, b);
      _node = prevEndNode.previousSibling;
      parent.insertBefore(prevEndNode, prevStartNode);
      prevEndNode = _node;
      prevEnd--;
      newStart++;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = oldData[prevEnd], b = newData[newStart];
    }
    a = oldData[prevStart], b = newData[newEnd];
    while(a[key] === b[key]) {
      loop = true;
      makeEqual$1(prevStartNode, b);
      _node = prevStartNode.nextSibling;
      parent.insertBefore(prevStartNode, prevEndNode.nextSibling);
      finalNode = prevStartNode;
      prevEndNode = prevStartNode.previousSibling;
      prevStartNode = _node;
      prevStart++;
      newEnd--;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = oldData[prevStart], b = newData[newEnd];
    }
  }
  if (newEnd < newStart) {
    if (prevStart <= prevEnd) {
      let next;
      while(prevStart <= prevEnd) {
        if (prevEnd === 0) {
          parent.removeChild(prevEndNode);
        } else {
          next = prevEndNode.previousSibling;
          parent.removeChild(prevEndNode);
          prevEndNode = next;
        }
        prevEnd--;
      }
    }
    return;
  }
  if (prevEnd < prevStart) {
    if (newStart <= newEnd) {
      while(newStart <= newEnd) {
        _node = createFn(newData[newStart]);
        parent.insertBefore(_node, prevEndNode.nextSibling);
        prevEndNode = _node;
        newStart++;
      }
    }
    return;
  }
  const oldKeys = new Array(newEnd + 1 - newStart), newKeys = new Map(), toDelete = [];
  for(let i = newStart; i <= newEnd; i++) {
    oldKeys[i] = -1;
    newKeys.set(newData[i][key], i);
  }
  let reusingNodes = 0;
  for(let i = prevStart; i <= prevEnd; i++) {
    if (newKeys.has(oldData[i][key])) {
      oldKeys[newKeys.get(oldData[i][key])] = i;
      reusingNodes++;
    } else {
      toDelete.push(i);
    }
  }
  if (reusingNodes === 0) {
    for(let i = newStart; i <= newEnd; i++) {
      if (i > prevEnd) {
        parent.insertBefore(createFn(newData[i]), prevStartNode);
      } else {
        _node = prevStartNode.nextSibling;
        prevStartNode.replaceWith(createFn(newData[i]));
        prevStartNode = _node;
      }
    }
    if (newEnd < prevEnd) {
      while (newEnd < prevEnd) {
        _node = prevEndNode.previousSibling;
        parent.removeChild(prevEndNode);
        prevEndNode = _node;
        prevEnd--;
      }
    }
    return;
  }
  const longestSeq = longestPositiveIncreasingSubsequence(oldKeys, newStart);
  const nodes = [];
  while(prevStart <= prevEnd) {
    nodes[prevStart] = prevStartNode;
    prevStartNode = prevStartNode.nextSibling;
    prevStart++;
  }
  let lisIdx = longestSeq.length - 1, tmpD;
  for(let i = newEnd; i >= newStart; i--) {
    if(longestSeq[lisIdx] === i) {
      finalNode = nodes[oldKeys[i]];
      makeEqual$1(finalNode, newData[i]);
      lisIdx--;
    } else {
      if (oldKeys[i] === -1) {
        tmpD = createFn(newData[i]);
      } else {
        tmpD = nodes[oldKeys[i]];
        makeEqual$1(tmpD, newData[i]);
      }
      parent.insertBefore(tmpD, finalNode);
      finalNode = tmpD;
    }
  }
  for(let i = 0; i < toDelete.length; i++) {
    parent.removeChild(nodes[toDelete[i]]);
  }
}
function longestPositiveIncreasingSubsequence(ns, newStart) {
  let seq = [],
    is  = [],
    l   = -1,
    pre = new Array(ns.length);
  for (let i = newStart, len = ns.length; i < len; i++) {
    let n = ns[i];
    if (n < 0) continue;
    let j = findGreatestIndexLEQ(seq, n);
    if (j !== -1) pre[i] = is[j];
    if (j === l) {
      l++;
      seq[l] = n;
      is[l]  = i;
    } else if (n < seq[j + 1]) {
      seq[j + 1] = n;
      is[j + 1] = i;
    }
  }
  for (let i = is[l]; l >= 0; i = pre[i], l--) {
    seq[l] = i;
  }
  return seq;
}
function findGreatestIndexLEQ(seq, n) {
  let lo = -1,
    hi = seq.length;
  if (hi > 0 && seq[hi - 1] <= n) return hi - 1;
  while (hi - lo > 1) {
    let mid = Math.floor((lo + hi) / 2);
    if (seq[mid] > n) {
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return lo;
}
var keyed = {
  makeChildrenEqualKeyed,
  longestPositiveIncreasingSubsequence
};

const { OUTER_REGEX } = constants;
function replacer(match) {
  let f;
  if (match.indexOf('return ') >= 0) {
    f = match;
  } else {
    f = 'return ' + match;
  }
  try {
    return new Function(f);
  } catch(e) {
    window.console.log(`Error processing binding: \`${f}\``);
    return '';
  }
}
function evaluate(fxn, el) {
  try {
    if (typeof fxn === 'string') return fxn;
    else return fxn.call(el);
  } catch(e) {
    const str = fxn.toString();
    window.console.log(`Error evaluating: \`${str.slice(str.indexOf('{') + 1, str.lastIndexOf('}'))}\` for element`, el);
    window.console.error(e);
  }
}
var bindings = {
  getBindingFxns: (string) => {
    const splitted = string.split(OUTER_REGEX), l = splitted.length, ret = [];
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

const { makeChildrenEqual: makeChildrenEqual$1 } = makeequal;
const { makeChildrenEqualKeyed: makeChildrenEqualKeyed$1 } = keyed;
const { evaluateBindings } = bindings;
const { TEMPLATE: TEMPLATE$1, KEY_ATTR } = constants;
function customElementUpdate(element, stateMap) {
  if (!element._refs) {
    return false;
  }
  stateMap = stateMap || element.constructor.stateMap;
  const l = element._refs.length;
  for (let i = 0; i < l; i++) {
    const data = stateMap[i].ref;
    const dom = element._refs[i];
    if (data.attributes) {
      for(let key in data.attributes) {
        if (key !== 'events') {
          const val = evaluateBindings(data.attributes[key], element);
          updateattribute(dom, key, val);
        } else {
          for(let event in data.attributes.events) {
            const eventLis = evaluateBindings(data.attributes.events[event], element);
            dom[event] = eventLis;
          }
          dom._root = element;
        }
      }
    }
    if (data.text === undefined) continue;
    const newValue = evaluateBindings(data.text, element);
    if (data.type === 0) {
      if (dom.data != newValue) dom.data = newValue;
    } else if (data.type === 2) {
      const key = dom.getAttribute(KEY_ATTR);
      if (key) makeChildrenEqualKeyed$1(dom, newValue, (state) => data.se.sifrrClone(true, state), key);
      else makeChildrenEqual$1(dom, newValue, (state) => data.se.sifrrClone(true, state));
    } else {
      let children;
      if (Array.isArray(newValue)) {
        children = newValue;
      } else if (newValue.content && newValue.content.nodeType === 11) {
        children = Array.prototype.slice.call(newValue.content.childNodes);
      } else if (newValue.nodeType) {
        children = [newValue];
      } else if (typeof newValue === 'string') {
        const temp = TEMPLATE$1();
        temp.innerHTML = newValue.toString();
        children = Array.prototype.slice.call(temp.content.childNodes);
      } else {
        children = Array.prototype.slice.call(newValue);
      }
      makeChildrenEqual$1(dom, children);
    }
  }
  if (element.onUpdate) element.onUpdate();
}
var update = customElementUpdate;

function SimpleElement(content, defaultState = null) {
  if (!content.nodeType && typeof content !== 'string') {
    if (!content[0] || !content[0].nodeType) {
      throw TypeError('First argument for SimpleElement should be of type string or DOM element');
    }
  }
  const templ = template(content);
  content = templ.content.firstElementChild || templ.content.firstChild;
  if (content.isSifrr || content.nodeName.indexOf('-') !== -1 ||
    (content.getAttribute && content.getAttribute('is') && content.getAttribute('is').indexOf('-') !== -1)
  ) {
    return content;
  }
  const stateMap = parser.createStateMap(content, false);
  function setProps(me) {
    me._refs = parser.collectRefsSimple(me, stateMap);
    Object.defineProperty(me, 'state', {
      get: () => me._state,
      set: (v) => {
        me._state = Object.assign(me._state || {}, v);
        update(me, stateMap);
      }
    });
  }
  setProps(content);
  if (defaultState) content.state = defaultState;
  content.sifrrClone = function(deep = true, newState) {
    const clone = content.cloneNode(deep);
    setProps(clone);
    if (newState) clone.state = newState;
    else if (content.state) clone.state = content.state;
    return clone;
  };
  return content;
}
var simpleelement = SimpleElement;

const { getBindingFxns } = bindings;
var repeatref = (sm, el, attr) => {
  sm.type = 2;
  sm.se = simpleelement(el.childNodes);
  sm.text = getBindingFxns(el.getAttribute(attr));
  el.textContent = '';
  el.removeAttribute(attr);
};

const { TEXT_NODE: TEXT_NODE$1, COMMENT_NODE: COMMENT_NODE$1, ELEMENT_NODE, REPEAT_ATTR } = constants;
const { getBindingFxns: getBindingFxns$1 } = bindings;
function customElementCreator(el, filter, isSifrrElement) {
  if (el.nodeType === TEXT_NODE$1 || el.nodeType === COMMENT_NODE$1) {
    const x = el.data;
    if (x.indexOf('${') > -1) return {
      type: 0,
      text: getBindingFxns$1(x.trim())
    };
  } else if (el.nodeType === ELEMENT_NODE) {
    const sm = {};
    if (isSifrrElement) {
      if (filter(el)) {
        const innerHTML = el.innerHTML;
        if (innerHTML.indexOf('${') >= 0) {
          sm.type = 1;
          sm.text = getBindingFxns$1(innerHTML.replace(/<!--((?:(?!-->).)+)-->/g, '$1').trim());
        }
      } else if (el.hasAttribute(REPEAT_ATTR)) {
        repeatref(sm, el, REPEAT_ATTR);
      }
    }
    const attrs = el.attributes, l = attrs.length;
    const attrStateMap = { events: {} };
    for (let i = 0; i < l; i++) {
      const attribute = attrs[i];
      if (attribute.name[0] === '_') {
        attrStateMap.events[attribute.name] = getBindingFxns$1(attribute.value);
      } else if (attribute.value.indexOf('${') >= 0) {
        attrStateMap[attribute.name] = getBindingFxns$1(attribute.value);
      }
    }
    if (Object.keys(attrStateMap.events).length === 0) delete attrStateMap.events;
    if (Object.keys(attrStateMap).length > 0) sm.attributes = attrStateMap;
    if (Object.keys(sm).length > 0) return sm;
  }
  return 0;
}
var creator = {
  creator: customElementCreator
};

const { collect: collect$1, create: create$1, collectSimple: collectSimple$1 } = ref;
const { creator: creator$1 } = creator;
const Parser = {
  collectRefs: collect$1,
  collectRefsSimple: collectSimple$1,
  createStateMap: (element, isSifrrElement) => create$1(element, creator$1, isSifrrElement),
  twoWayBind: (e) => {
    const target = e.composedPath ? e.composedPath()[0] : e.target;
    if (!target.hasAttribute('data-sifrr-bind') || target._root === null) return;
    const value = target.value || target.textContent;
    let state = {};
    if (!target._root) {
      let root;
      root = target;
      while(root && !root.isSifrr) root = root.parentNode || root.host;
      if (root) target._root = root;
      else target._root = null;
    }
    state[target.getAttribute('data-sifrr-bind')] = value;
    if (target._root) target._root.state = state;
  }
};
var parser = Parser;

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
    if (this._executed) return window.console.log(`'${this.elementName}' element's javascript was already executed`);
    this._executed = true;
    if (!js) {
      return this.executeHTMLScripts();
    } else {
      return this.js.then((script) => {
        new Function(script + `\n //# sourceURL=${this.jsUrl}`).call();
      }).catch((e) => {
        window.console.error(e);
        window.console.log(`JS file for '${this.elementName}' gave error. Trying to get html file.`);
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
          new Function(script.text + `\n //# sourceURL=${this.htmlUrl}`).call({ currentTempate: file.querySelector('template') });
        }
      });
    }).catch(e => { throw e; });
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

const { makeChildrenEqual: makeChildrenEqual$2 } = makeequal;
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
        const stateMap = this.constructor.stateMap, content = this.constructor.ctemp.content.cloneNode(true);
        this._refs = parser.collectRefs(content, stateMap);
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
      if(!this.constructor.useShadowRoot && this.__content) {
        makeChildrenEqual$2(this, Array.prototype.slice.call(this.__content.childNodes));
        delete this.__content;
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
      update(this);
    }
    onUpdate() {}
    isSifrr(name = null) {
      if (name) return name === this.constructor.elementName;
      else return true;
    }
    sifrrClone(deep, state) {
      const clone = this.cloneNode(deep);
      clone._state = state;
      return clone;
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
  };
}
var element = elementClassFactory(window.HTMLElement);

const SYNTHETIC_EVENTS = {};
const opts = { capture: true, passive: true };
const nativeToSyntheticEvent = (e, name) => {
  return Promise.resolve((() => {
    const target = e.composedPath ? e.composedPath()[0] : e.target;
    let dom = target;
    while(dom) {
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
SifrrDom.setup = function(config) {
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
SifrrDom.load = function(elemName, { url, js = true } = {}) {
  if (window.customElements.get(elemName)) { return window.console.warn(`Error loading Element: ${elemName} - Custom Element with this name is already defined.`); }
  let loader$$1 = new SifrrDom.Loader(elemName, url);
  const wd = customElements.whenDefined(elemName);
  SifrrDom.loadingElements.push(wd);
  return loader$$1.executeScripts(js).then(() => {
    if (!window.customElements.get(elemName)) {
      window.console.warn(`Executing '${elemName}' file didn't register the element. Ignore if you are registering element in a promise or async function.`);
    }
  }).catch(e => {
    SifrrDom.loadingElements.splice(SifrrDom.loadingElements.indexOf(wd), 1);
    window.console.error(e);
  });
};
SifrrDom.loading = () => {
  return Promise.all(SifrrDom.loadingElements);
};
var sifrr_dom = SifrrDom;

export default sifrr_dom;
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.dom.module.js.map
