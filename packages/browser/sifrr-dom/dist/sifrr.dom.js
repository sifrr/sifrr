/*! Sifrr.Dom v0.0.4 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = global || self, (global.Sifrr = global.Sifrr || {}, global.Sifrr.Dom = factory()));
}(this, function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	const temp = window.document.createElement('template');
	const script = window.document.createElement('script');
	const reg = '(\\${(?:(?:[^{}$]|{(?:[^{}$])*})*)})';
	var constants = {
	  TEMPLATE: () => temp.cloneNode(false),
	  SCRIPT: () => script.cloneNode(false),
	  TREE_WALKER: () => window.document.createTreeWalker(window.document, window.NodeFilter.SHOW_ALL, null, false),
	  TEXT_NODE: 3,
	  COMMENT_NODE: 8,
	  ELEMENT_NODE: 1,
	  OUTER_REGEX: new RegExp(reg, 'g'),
	  STATE_REGEX: /^\$\{this\.state\.([a-zA-Z0-9_$]+)\}$/,
	  HTML_ATTR: 'data-sifrr-html',
	  REPEAT_ATTR: 'data-sifrr-repeat',
	  KEY_ATTR: 'data-sifrr-key'
	};

	const {
	  TEXT_NODE,
	  TREE_WALKER
	} = constants;
	const TW_SHARED = TREE_WALKER();
	function collect(element, stateMap) {
	  const l = stateMap.length,
	        refs = new Array(l);
	  TW_SHARED.currentNode = element;
	  for (let i = 0, n; i < l; i++) {
	    n = stateMap[i].idx;
	    while (--n) element = TW_SHARED.nextNode();
	    refs[i] = element;
	  }
	  return refs;
	}
	function create(node, fxn, passedArg) {
	  const TW = TREE_WALKER();
	  let indices = [],
	      ref,
	      idx = 0,
	      ntr;
	  TW.currentNode = node;
	  while (node) {
	    if (node.nodeType === TEXT_NODE && node.data.trim() === '') {
	      ntr = node;
	      node = TW.nextNode();
	      ntr.remove();
	    } else {
	      if (ref = fxn(node, passedArg)) {
	        indices.push({
	          idx: idx + 1,
	          ref
	        });
	        idx = 1;
	      } else {
	        idx++;
	      }
	      node = TW.nextNode();
	    }
	  }
	  return indices;
	}
	var ref = {
	  collect,
	  create
	};

	const {
	  TEMPLATE
	} = constants;
	var template = (str, ...extra) => {
	  if (str.tagName && str.tagName === 'TEMPLATE') {
	    return str;
	  }
	  const tmp = TEMPLATE();
	  if (typeof str === 'string') ; else if (Array.isArray(str) && typeof str[0] === 'string') {
	    str = String.raw(str, ...extra);
	  } else if (str instanceof NodeList || Array.isArray(str) && str[0].nodeType) {
	    Array.from(str).forEach(s => {
	      tmp.content.appendChild(s);
	    });
	    return tmp;
	  } else if (str.nodeType) {
	    tmp.content.appendChild(str);
	    return tmp;
	  } else {
	    return str;
	  }
	  str = str.replace(/(\\)?\$(\\)?\{/g, '${');
	  tmp.innerHTML = str;
	  return tmp;
	};

	var updateattribute = (element, name, newValue) => {
	  if (newValue === false || newValue === null || newValue === undefined) element.hasAttribute(name) && element.removeAttribute(name);else if (name === 'class') element.className = newValue;else if (name === 'id' || name === 'value') element[name] = newValue;else if (element.getAttribute(name) !== newValue) element.setAttribute(name, newValue);
	};

	const Json = {
	  shallowEqual: (a, b) => {
	    for (const key in a) {
	      if (!(key in b) || a[key] !== b[key]) {
	        return false;
	      }
	    }
	    for (const key in b) {
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
	  COMMENT_NODE
	} = constants;
	function makeChildrenEqual(parent, newChildren, createFn, isNode = false) {
	  const newL = newChildren.length,
	        oldL = parent.childNodes.length;
	  if (oldL > newL) {
	    let i = oldL;
	    while (i > newL) {
	      parent.removeChild(parent.lastChild);
	      i--;
	    }
	  }
	  let item,
	      head = parent.firstChild,
	      curNewChild = newChildren[0];
	  if (isNode) {
	    while (head) {
	      item = curNewChild.nextSibling;
	      head = makeEqual(head, curNewChild).nextSibling;
	      curNewChild = item;
	    }
	    while (curNewChild) {
	      item = curNewChild.nextSibling;
	      parent.appendChild(curNewChild);
	      curNewChild = item;
	    }
	  } else {
	    let i = 0;
	    while (head) {
	      head = makeEqual(head, newChildren[i]).nextSibling;
	      i++;
	    }
	    while (i < newL) {
	      item = newChildren[i];
	      parent.appendChild(item.nodeType ? item : createFn(item));
	      i++;
	    }
	  }
	}
	function makeEqual(oldNode, newNode) {
	  if (!newNode.nodeType) {
	    if (!shallowEqual(oldNode._state, newNode)) oldNode.state = newNode;
	    return oldNode;
	  }
	  if (oldNode.nodeName !== newNode.nodeName) {
	    oldNode.replaceWith(newNode);
	    return newNode;
	  }
	  if (oldNode.nodeType === TEXT_NODE$1 || oldNode.nodeType === COMMENT_NODE) {
	    if (oldNode.data !== newNode.data) oldNode.data = newNode.data;
	    return oldNode;
	  }
	  if (newNode.state) oldNode.state = newNode.state;
	  const oldAttrs = oldNode.attributes,
	        newAttrs = newNode.attributes;
	  for (let i = newAttrs.length - 1; i >= 0; --i) {
	    updateattribute(oldNode, newAttrs[i].name, newAttrs[i].value);
	  }
	  for (let j = oldAttrs.length - 1; j >= 0; --j) {
	    if (!newNode.hasAttribute(oldAttrs[j].name)) oldNode.removeAttribute(oldAttrs[j].name);
	  }
	  makeChildrenEqual(oldNode, newNode.childNodes, undefined, true);
	  return oldNode;
	}
	var makeequal = {
	  makeEqual,
	  makeChildrenEqual
	};

	const {
	  makeEqual: makeEqual$1
	} = makeequal;
	function makeChildrenEqualKeyed(parent, newData, createFn, key) {
	  const newL = newData.length,
	        oldL = parent.childNodes.length;
	  if (oldL === 0) {
	    for (let i = 0; i < newL; i++) {
	      parent.appendChild(createFn(newData[i]));
	    }
	    return;
	  }
	  let prevStart = 0,
	      newStart = 0,
	      loop = true,
	      prevEnd = oldL - 1,
	      newEnd = newL - 1,
	      prevStartNode = parent.firstChild,
	      prevEndNode = parent.lastChild,
	      finalNode,
	      a,
	      b,
	      _node;
	  fixes: while (loop) {
	    loop = false;
	    a = prevStartNode.state, b = newData[newStart];
	    while (a[key] === b[key]) {
	      makeEqual$1(prevStartNode, b);
	      prevStart++;
	      prevStartNode = prevStartNode.nextSibling;
	      newStart++;
	      if (prevEnd < prevStart || newEnd < newStart) break fixes;
	      a = prevStartNode.state, b = newData[newStart];
	    }
	    a = prevEndNode.state, b = newData[newEnd];
	    while (a[key] === b[key]) {
	      makeEqual$1(prevEndNode, b);
	      prevEnd--;
	      finalNode = prevEndNode;
	      prevEndNode = prevEndNode.previousSibling;
	      newEnd--;
	      if (prevEnd < prevStart || newEnd < newStart) break fixes;
	      a = prevEndNode.state, b = newData[newEnd];
	    }
	    a = prevEndNode.state, b = newData[newStart];
	    while (a[key] === b[key]) {
	      loop = true;
	      makeEqual$1(prevEndNode, b);
	      _node = prevEndNode.previousSibling;
	      parent.insertBefore(prevEndNode, prevStartNode);
	      prevEndNode = _node;
	      prevEnd--;
	      newStart++;
	      if (prevEnd < prevStart || newEnd < newStart) break fixes;
	      a = prevEndNode.state, b = newData[newStart];
	    }
	    a = prevStartNode.state, b = newData[newEnd];
	    while (a[key] === b[key]) {
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
	      a = prevStartNode.state, b = newData[newEnd];
	    }
	  }
	  if (newEnd < newStart) {
	    if (prevStart <= prevEnd) {
	      let next;
	      while (prevStart <= prevEnd) {
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
	      while (newStart <= newEnd) {
	        _node = createFn(newData[newStart]);
	        parent.insertBefore(_node, finalNode);
	        prevEndNode = _node;
	        newStart++;
	      }
	    }
	    return;
	  }
	  const oldKeys = new Array(newEnd + 1 - newStart),
	        newKeys = new Map(),
	        nodes = new Array(prevEnd - prevStart + 1),
	        toDelete = [];
	  for (let i = newStart; i <= newEnd; i++) {
	    oldKeys[i] = -1;
	    newKeys.set(newData[i][key], i);
	  }
	  let reusingNodes = 0;
	  while (prevStart <= prevEnd) {
	    if (newKeys.has(prevStartNode.state[key])) {
	      oldKeys[newKeys.get(prevStartNode.state[key])] = prevStart;
	      reusingNodes++;
	    } else {
	      toDelete.push(prevStartNode);
	    }
	    nodes[prevStart] = prevStartNode;
	    prevStartNode = prevStartNode.nextSibling;
	    prevStart++;
	  }
	  for (let i = 0; i < toDelete.length; i++) {
	    parent.removeChild(toDelete[i]);
	  }
	  if (reusingNodes === 0) {
	    for (let i = newStart; i <= newEnd; i++) {
	      parent.insertBefore(createFn(newData[i]), prevStartNode);
	    }
	    return;
	  }
	  const longestSeq = longestPositiveIncreasingSubsequence(oldKeys, newStart);
	  let lisIdx = longestSeq.length - 1,
	      tmpD;
	  for (let i = newEnd; i >= newStart; i--) {
	    if (longestSeq[lisIdx] === i) {
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
	}
	function longestPositiveIncreasingSubsequence(ns, newStart) {
	  let seq = [],
	      is = [],
	      l = -1,
	      pre = new Array(ns.length);
	  for (let i = newStart, len = ns.length; i < len; i++) {
	    let n = ns[i];
	    if (n < 0) continue;
	    let j = findGreatestIndexLEQ(seq, n);
	    if (j !== -1) pre[i] = is[j];
	    if (j === l) {
	      l++;
	      seq[l] = n;
	      is[l] = i;
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

	const {
	  OUTER_REGEX,
	  STATE_REGEX
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
	    window.console.log("Error processing binding: `".concat(f, "`"));
	    return '';
	  }
	}
	function evaluate(fxn, el) {
	  try {
	    if (typeof fxn === 'string') return fxn;else return fxn.call(el);
	  } catch (e) {
	    const str = fxn.toString();
	    window.console.log("Error evaluating: `".concat(str.slice(str.indexOf('{') + 1, str.lastIndexOf('}')), "` for element"), el);
	    window.console.error(e);
	  }
	}
	const Bindings = {
	  getBindingFxns: string => {
	    const splitted = string.split(OUTER_REGEX),
	          l = splitted.length,
	          ret = [];
	    for (let i = 0; i < l; i++) {
	      if (splitted[i][0] === '$' && splitted[i][1] === '{') {
	        ret.push(replacer(splitted[i].slice(2, -1)));
	      } else if (splitted[i]) ret.push(splitted[i]);
	    }
	    if (ret.length === 1) return ret[0];
	    return ret;
	  },
	  getStringBindingFxn: string => {
	    const match = string.match(STATE_REGEX);
	    if (match) return match[1];
	    return Bindings.getBindingFxns(string);
	  },
	  evaluateBindings: (fxns, element) => {
	    if (typeof fxns === 'function') return evaluate(fxns, element);
	    return fxns.map(fxn => evaluate(fxn, element)).join('');
	  },
	  evaluate: evaluate,
	  replacer: replacer
	};
	var bindings = Bindings;

	const {
	  makeChildrenEqual: makeChildrenEqual$1
	} = makeequal;
	const {
	  makeChildrenEqualKeyed: makeChildrenEqualKeyed$1
	} = keyed;
	const {
	  evaluateBindings
	} = bindings;
	const {
	  TEMPLATE: TEMPLATE$1,
	  KEY_ATTR
	} = constants;
	function update(element, stateMap) {
	  stateMap = stateMap || element.constructor.stateMap;
	  const l = element._refs ? element._refs.length : 0;
	  for (let i = 0; i < l; i++) {
	    const data = stateMap[i].ref,
	          dom = element._refs[i];
	    if (data.type === 0) {
	      if (dom.data != element._state[data.text]) dom.data = element._state[data.text];
	      continue;
	    } else if (data.type === 1) {
	      const newValue = evaluateBindings(data.text, element);
	      if (dom.data != newValue) dom.data = newValue;
	      continue;
	    }
	    if (data.events) {
	      if (!dom._sifrrEventSet) {
	        for (let i = 0, l = data.events.length; i < l; i++) {
	          const ev = data.events[i];
	          dom[ev[0]] = evaluateBindings(ev[1], element);
	        }
	        dom._root = element;
	        dom._sifrrEventSet = true;
	      }
	    }
	    if (data.attributes) {
	      for (let i = 0, l = data.attributes.length; i < l; i++) {
	        const attr = data.attributes[i];
	        let newValue;
	        if (attr[1] === 0) newValue = element._state[attr[2]];else newValue = evaluateBindings(attr[2], element);
	        updateattribute(dom, attr[0], newValue);
	      }
	    }
	    if (data.text === undefined) continue;
	    let newValue;
	    if (typeof data.text === 'string') newValue = element._state[data.text];else newValue = evaluateBindings(data.text, element);
	    if (!newValue || newValue.length === 0) dom.textContent = '';else if (data.type === 3) {
	      let key;
	      data.se.root = element;
	      if (data.keyed && (key = dom.getAttribute(KEY_ATTR))) {
	        makeChildrenEqualKeyed$1(dom, newValue, data.se.sifrrClone.bind(data.se), key);
	      } else makeChildrenEqual$1(dom, newValue, data.se.sifrrClone.bind(data.se));
	    } else {
	      const newValue = evaluateBindings(data.text, element);
	      let children,
	          isNode = false;
	      if (Array.isArray(newValue)) {
	        children = newValue;
	      } else if (newValue.content && newValue.content.nodeType === 11) {
	        children = newValue.content.childNodes;
	        isNode = true;
	      } else if (newValue.nodeType) {
	        children = [newValue];
	      } else if (typeof newValue === 'string') {
	        const temp = TEMPLATE$1();
	        temp.innerHTML = newValue.toString();
	        children = temp.content.childNodes;
	        isNode = true;
	      } else {
	        children = Array.prototype.slice.call(newValue);
	      }
	      makeChildrenEqual$1(dom, children, undefined, isNode);
	    }
	  }
	}
	var update_1 = update;

	const {
	  collect: collect$1,
	  create: create$1
	} = ref;
	function sifrrClone(newState) {
	  const clone = this.cloneNode(true);
	  clone.root = this.root;
	  clone._refs = collect$1(clone, this.stateMap);
	  clone._state = Object.assign({}, this.defaultState, newState);
	  Object.defineProperty(clone, 'state', this.stateProps);
	  update_1(clone, this.stateMap);
	  return clone;
	}
	function SimpleElement(content, defaultState = null) {
	  const templ = template(content);
	  if (!templ.content || templ.content.childNodes.length < 1) {
	    throw TypeError('First argument for SimpleElement should be of type string or DOM element');
	  }
	  content = templ.content.firstElementChild || templ.content.firstChild;
	  if (content.isSifrr || content.nodeName.indexOf('-') !== -1 || content.getAttribute && content.getAttribute('is') && content.getAttribute('is').indexOf('-') > 0) {
	    if (!content.isSifrr) {
	      window.document.body.appendChild(content);
	      window.document.body.removeChild(content);
	    }
	    return content;
	  }
	  content.defaultState = defaultState;
	  content.stateMap = create$1(content, creator_1, defaultState);
	  content.sifrrClone = sifrrClone;
	  content.stateProps = {
	    get: function () {
	      return this._state;
	    },
	    set: function (v) {
	      if (this._state !== v) Object.assign(this._state, v);
	      update_1(this, content.stateMap);
	    }
	  };
	  return content;
	}
	var simpleelement = SimpleElement;

	const {
	  getStringBindingFxn
	} = bindings;
	const {
	  KEY_ATTR: KEY_ATTR$1,
	  REPEAT_ATTR
	} = constants;
	var repeatref = (sm, el) => {
	  sm.type = 3;
	  let defaultState;
	  if (el.hasAttribute('data-sifrr-default-state')) defaultState = JSON.parse(el.getAttribute('data-sifrr-default-state'));
	  sm.se = simpleelement(el.childNodes, defaultState);
	  sm.text = getStringBindingFxn(el.getAttribute(REPEAT_ATTR));
	  sm.keyed = el.hasAttribute(KEY_ATTR$1);
	  el.removeAttribute(REPEAT_ATTR);
	};

	const {
	  TEXT_NODE: TEXT_NODE$2,
	  COMMENT_NODE: COMMENT_NODE$1,
	  ELEMENT_NODE,
	  HTML_ATTR,
	  REPEAT_ATTR: REPEAT_ATTR$1
	} = constants;
	const {
	  getBindingFxns,
	  getStringBindingFxn: getStringBindingFxn$1
	} = bindings;
	function isHtml(el) {
	  return el.hasAttribute && el.hasAttribute(HTML_ATTR);
	}
	function creator(el, defaultState) {
	  if (el.nodeType === TEXT_NODE$2 || el.nodeType === COMMENT_NODE$1) {
	    const x = el.data;
	    if (x.indexOf('${') > -1) {
	      const binding = getStringBindingFxn$1(x.trim());
	      if (typeof binding !== 'string') {
	        return {
	          type: 1,
	          text: binding
	        };
	      } else {
	        if (defaultState) el.data = defaultState[binding];
	        return {
	          type: 0,
	          text: binding
	        };
	      }
	    }
	  } else if (el.nodeType === ELEMENT_NODE) {
	    const sm = {};
	    if (isHtml(el)) {
	      const innerHTML = el.innerHTML;
	      if (innerHTML.indexOf('${') > -1) {
	        sm.type = 2;
	        sm.text = getBindingFxns(innerHTML.replace(/<!--((?:(?!-->).)+)-->/g, '$1').trim());
	      }
	      el.textContent = '';
	    } else if (el.hasAttribute(REPEAT_ATTR$1)) {
	      repeatref(sm, el);
	    }
	    const attrs = el.attributes,
	          l = attrs.length;
	    const attrStateMap = [];
	    const eventMap = [];
	    for (let i = 0; i < l; i++) {
	      const attribute = attrs[i];
	      if (attribute.name[0] === '_' && attribute.value.indexOf('${') >= 0) {
	        eventMap.push([attribute.name, getBindingFxns(attribute.value)]);
	      } else if (attribute.value.indexOf('${') >= 0) {
	        const binding = getStringBindingFxn$1(attribute.value);
	        if (typeof binding !== 'string') {
	          attrStateMap.push([attribute.name, 1, binding]);
	        } else {
	          attrStateMap.push([attribute.name, 0, binding]);
	          if (defaultState) updateattribute(el, attribute.name, defaultState[binding]);
	        }
	      }
	    }
	    if (eventMap.length > 0) sm.events = eventMap;
	    if (attrStateMap.length > 0) sm.attributes = attrStateMap;
	    if (Object.keys(sm).length > 0) return sm;
	  }
	  return 0;
	}
	var creator_1 = creator;

	class Loader {
	  constructor(elemName, url) {
	    if (!window.fetch) throw Error('Sifrr.Dom.load requires Fetch API to work.');
	    if (this.constructor.all[elemName]) return this.constructor.all[elemName];
	    this.elementName = elemName;
	    Loader.all[this.elementName] = this;
	    this.url = url;
	  }
	  executeScripts(js = true) {
	    if (this._exec) return this._exec;
	    if (!js) {
	      return this._exec = this.constructor.executeHTML(this.getUrl('html'), this), this._exec;
	    } else {
	      return this._exec = this.constructor.executeJS(this.getUrl('js')).catch(e => {
	        window.console.error(e);
	        window.console.log("JS file for '".concat(this.elementName, "' gave error. Trying to get html file."));
	        return this.constructor.executeHTML(this.getUrl('html'), this);
	      }), this._exec;
	    }
	  }
	  getUrl(type = 'js') {
	    return this.url || "".concat(window.Sifrr.Dom.config.baseUrl + '/', "elements/").concat(this.elementName.split('-').join('/'), ".").concat(type);
	  }
	  static getFile(url) {
	    return window.fetch(url).then(resp => {
	      if (resp.ok) return resp.text();else throw Error("".concat(this.getUrl('html'), " - ").concat(resp.status, " ").concat(resp.statusText));
	    });
	  }
	  static executeHTML(url, me) {
	    return this.getFile(url).then(file => template(file).content).then(content => {
	      let promise = Promise.resolve(true);
	      me.template = content.querySelector('template');
	      content.querySelectorAll('script').forEach(script => {
	        if (script.src) {
	          window.fetch(script.src);
	          promise = promise.then(() => window.fetch(script.src).then(resp => resp.text())).then(text => new Function(text + "\n//# sourceURL=".concat(script.src)).call(window));
	        } else {
	          promise = promise.then(() => new Function(script.text + "\n//# sourceURL=".concat(url)).call(window));
	        }
	      });
	      return promise;
	    });
	  }
	  static executeJS(url) {
	    return this.getFile(url).then(script => {
	      return new Function(script + "\n //# sourceURL=".concat(url)).call();
	    });
	  }
	}
	Loader.all = {};
	var loader = Loader;

	const SYNTHETIC_EVENTS = {};
	const opts = {
	  capture: true,
	  passive: true
	};
	const getEventListener = name => {
	  return e => {
	    const target = e.composedPath ? e.composedPath()[0] : e.target;
	    let dom = target;
	    while (dom) {
	      const eventHandler = dom["_".concat(name)] || (dom.hasAttribute ? dom.getAttribute("_".concat(name)) : null);
	      if (typeof eventHandler === 'function') {
	        eventHandler.call(dom._root || window, e, target);
	      } else if (typeof eventHandler === 'string') {
	        new Function('event', 'target', eventHandler).call(dom._root || window, event, target);
	      }
	      cssMatchEvent(e, name, dom, target);
	      dom = dom.parentNode || dom.host;
	    }
	  };
	};
	const cssMatchEvent = (e, name, dom, target) => {
	  function callEach(fxns, isElement) {
	    fxns.forEach(fxn => {
	      if (!isElement || fxn.__dom === dom) fxn(e, target, dom);
	    });
	  }
	  for (let css in SYNTHETIC_EVENTS[name]) {
	    if (typeof dom.matches === 'function' && dom.matches(css) || dom.nodeType === 9 && css === 'document' || css === 'element') callEach(SYNTHETIC_EVENTS[name][css], css === 'element');
	  }
	};
	const Event = {
	  all: SYNTHETIC_EVENTS,
	  add: name => {
	    if (SYNTHETIC_EVENTS[name]) return false;
	    const namedEL = getEventListener(name);
	    window.addEventListener(name, namedEL, opts);
	    SYNTHETIC_EVENTS[name] = {};
	    return true;
	  },
	  addListener: (name, css, fxn) => {
	    if (!SYNTHETIC_EVENTS[name]) throw Error("You need to call Sifrr.Dom.Event.add('".concat(name, "') before using listeners."));
	    if (typeof css !== 'string') {
	      fxn.__dom = css;
	      css = 'element';
	    }
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
	    if (typeof el === 'string') el = document.$(el);
	    const ce = new CustomEvent(name, Object.assign({
	      bubbles: true,
	      composed: true
	    }, options));
	    el.dispatchEvent(ce);
	  },
	  opts,
	  getEventListener
	};
	var event_1 = Event;

	const {
	  collect: collect$2,
	  create: create$2
	} = ref;
	const {
	  trigger
	} = event_1;
	function elementClassFactory(baseClass) {
	  return class extends baseClass {
	    static extends(htmlElementClass) {
	      return elementClassFactory(htmlElementClass);
	    }
	    static get observedAttributes() {
	      return ['data-sifrr-state'].concat(this.observedAttrs()).concat(this.syncedAttrs());
	    }
	    static syncedAttrs() {
	      return [];
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
	      if (this._ctemp) return this._ctemp;
	      if (this.template) {
	        this._ctemp = template(this.template);
	        if (this.useShadowRoot && window.ShadyCSS && !window.ShadyCSS.nativeShadow) {
	          window.ShadyCSS.prepareTemplate(this._ctemp, this.elementName);
	        }
	        this.stateMap = create$2(this._ctemp.content, creator_1, this.defaultState);
	      }
	      return this._ctemp || false;
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
	        this._refs = collect$2(content, this.constructor.stateMap);
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
	      this.connected = true;
	      if (this.__content) {
	        if (this.childNodes.length !== 0) this.textContent = '';
	        this.appendChild(this.__content);
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
	      if (this.constructor.syncedAttrs().indexOf(attrName) > -1) {
	        this[attrName] = newVal;
	      }
	      this.onAttributeChange(attrName, oldVal, newVal);
	    }
	    onAttributeChange() {}
	    get state() {
	      return this._state;
	    }
	    set state(v) {
	      if (!this._state) return;
	      if (this._state !== v) Object.assign(this._state, v);
	      this.update();
	      this.onStateChange();
	    }
	    onStateChange() {}
	    update() {
	      this.beforeUpdate();
	      update_1(this);
	      if (this._update || this.hasAttribute('_update')) {
	        trigger(this, 'update', {
	          detail: {
	            state: this.state
	          }
	        });
	      }
	      this.onUpdate();
	    }
	    beforeUpdate() {}
	    onUpdate() {}
	    isSifrr(name = null) {
	      if (name) return name === this.constructor.elementName;else return true;
	    }
	    sifrrClone(state) {
	      const clone = this.cloneNode(false);
	      clone._state = state;
	      clone.root = this.root;
	      return clone;
	    }
	    clearState() {
	      this._state = {};
	      this.update();
	    }
	    $(args, sr = true) {
	      if (this.shadowRoot && sr) return this.shadowRoot.querySelector(args);else return this.querySelector(args);
	    }
	    $$(args, sr = true) {
	      if (this.shadowRoot && sr) return this.shadowRoot.querySelectorAll(args);else return this.querySelectorAll(args);
	    }
	  };
	}
	var element = elementClassFactory(window.HTMLElement);

	var twowaybind = e => {
	  const target = e.composedPath ? e.composedPath()[0] : e.target;
	  if (!target.hasAttribute('data-sifrr-bind') || target._root === null) return;
	  const value = target.value || target.textContent;
	  let state = {};
	  if (!target._root) {
	    let root;
	    root = target.parentNode;
	    while (root && !root.isSifrr) root = root.parentNode || root.host;
	    if (root) target._root = root;else target._root = null;
	  }
	  state[target.getAttribute('data-sifrr-bind')] = value;
	  if (target._root) target._root.state = state;
	};

	let SifrrDom = {};
	SifrrDom.elements = {};
	SifrrDom.loadingElements = {};
	SifrrDom.registering = [];
	SifrrDom.Element = element;
	SifrrDom.twoWayBind = twowaybind;
	SifrrDom.Loader = loader;
	SifrrDom.SimpleElement = simpleelement;
	SifrrDom.Event = event_1;
	SifrrDom.makeChildrenEqual = makeequal.makeChildrenEqual;
	SifrrDom.makeChildrenEqualKeyed = keyed.makeChildrenEqualKeyed;
	SifrrDom.makeEqual = makeequal.makeEqual;
	SifrrDom.template = template;
	SifrrDom.register = (Element, options = {}) => {
	  Element.useSR = SifrrDom.config.useShadowRoot;
	  const name = Element.elementName;
	  if (!name) {
	    throw Error('Error creating Custom Element: No name given.', Element);
	  } else if (window.customElements.get(name)) {
	    commonjsGlobal.console.warn("Error creating Element: ".concat(name, " - Custom Element with this name is already defined."));
	  } else if (name.indexOf('-') < 1) {
	    throw Error("Error creating Element: ".concat(name, " - Custom Element name must have one dash '-'"));
	  } else {
	    let before;
	    if (Array.isArray(options.dependsOn)) {
	      before = Promise.all(options.dependsOn.map(en => SifrrDom.load(en)));
	    } else if (typeof options.dependsOn === 'string') {
	      before = SifrrDom.load(options.dependsOn);
	    } else before = Promise.resolve(true);
	    delete options.dependsOn;
	    const registering = before.then(() => window.customElements.define(name, Element, options));
	    SifrrDom.registering[name] = registering;
	    return registering.then(() => {
	      SifrrDom.elements[name] = Element;
	      delete SifrrDom.registering[name];
	    }).catch(error => {
	      throw Error("Error creating Custom Element: ".concat(name, " - ").concat(error.message));
	    });
	  }
	};
	SifrrDom.setup = function (config) {
	  HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
	  HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
	  document.$ = document.querySelector;
	  document.$$ = document.querySelectorAll;
	  SifrrDom.config = Object.assign({
	    baseUrl: '',
	    useShadowRoot: true,
	    events: []
	  }, config);
	  if (typeof SifrrDom.config.baseUrl !== 'string') throw Error('baseUrl should be a string');
	  SifrrDom.config.events.push('input', 'change', 'update');
	  SifrrDom.config.events.forEach(e => SifrrDom.Event.add(e));
	  SifrrDom.Event.addListener('input', 'document', SifrrDom.twoWayBind);
	  SifrrDom.Event.addListener('change', 'document', SifrrDom.twoWayBind);
	  window.Sifrr = window.Sifrr || {};
	  window.Sifrr.Dom = window.Sifrr.Dom || SifrrDom;
	};
	SifrrDom.load = function (elemName, {
	  url,
	  js = true
	} = {}) {
	  if (window.customElements.get(elemName)) {
	    return Promise.resolve(window.console.warn("Error loading Element: ".concat(elemName, " - Custom Element with this name is already defined.")));
	  }
	  SifrrDom.loadingElements[elemName] = window.customElements.whenDefined(elemName);
	  let loader = new SifrrDom.Loader(elemName, url);
	  return loader.executeScripts(js).then(() => SifrrDom.registering[elemName]).then(() => {
	    if (!window.customElements.get(elemName)) {
	      window.console.warn("Executing '".concat(elemName, "' file didn't register the element."));
	    }
	    delete SifrrDom.registering[elemName];
	    delete SifrrDom.loadingElements[elemName];
	  }).catch(e => {
	    delete SifrrDom.registering[elemName];
	    delete SifrrDom.loadingElements[elemName];
	    throw e;
	  });
	};
	SifrrDom.loading = () => {
	  const promises = [];
	  for (let el in SifrrDom.loadingElements) {
	    promises.push(SifrrDom.loadingElements[el]);
	  }
	  return Promise.all(promises);
	};
	var sifrr_dom = SifrrDom;

	return sifrr_dom;

}));
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.dom.js.map
