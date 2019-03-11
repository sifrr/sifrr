/*! Sifrr.Dom v0.0.3 - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, (global.Sifrr = global.Sifrr || {}, global.Sifrr.Dom = factory()));
}(this, function () { 'use strict';

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
    STATE_REGEX: /^\$\{this\.state\.([a-zA-Z0-9_$]+)\}$/,
    HTML_ATTR: 'data-sifrr-html',
    REPEAT_ATTR: 'data-sifrr-repeat',
    KEY_ATTR: 'data-sifrr-key'
  };

  const TREE_WALKER = window.document.createTreeWalker(window.document, window.NodeFilter.SHOW_ALL, null, false);
  const {
    HTML_ATTR,
    TEXT_NODE
  } = constants;
  function isHtml(el) {
    return el.hasAttribute && el.hasAttribute(HTML_ATTR);
  }
  TREE_WALKER.nextFilteredNode = function () {
    let node = this.currentNode;
    if (isHtml(node)) {
      node = this.nextSibling() || (this.parentNode(), this.nextSibling());
    } else node = this.nextNode();
    return node;
  };
  function collect(node, stateMap, next = 'nextFilteredNode') {
    const l = stateMap.length,
          refs = new Array(l);
    TREE_WALKER.currentNode = node;
    for (let i = 0, n; i < l; i++) {
      n = stateMap[i].idx;
      while (--n) TREE_WALKER[next]();
      refs[i] = TREE_WALKER.currentNode;
    }
    return refs;
  }
  function create(node, fxn, passedArg) {
    let indices = [],
        ref,
        idx = 0,
        ntr;
    TREE_WALKER.currentNode = node;
    while (node) {
      if (node.nodeType === TEXT_NODE && node.data.trim() === '') {
        ntr = node;
        node = TREE_WALKER.nextFilteredNode(node);
        ntr.remove();
      } else {
        if (ref = fxn(node, isHtml, passedArg)) {
          indices.push({
            idx: idx + 1,
            ref
          });
          idx = 1;
        } else {
          idx++;
        }
        node = TREE_WALKER.nextFilteredNode(node);
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
    const tmp = TEMPLATE();
    if (typeof str === 'string') ; else if (str[0] && typeof str[0] === 'string') {
      str = String.raw(str, ...extra);
    } else if (str[0]) {
      Array.from(str).forEach(s => {
        tmp.content.appendChild(s);
      });
      return tmp;
    } else if (str.nodeType && !str.content) {
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
    if (newValue === false || newValue === null || newValue === undefined) element.hasAttribute(name) && element.removeAttribute(name);else if (name === 'class') {
      element.className = newValue;
    } else if (name === 'id' || name === 'value') {
      element[name] = newValue;
    } else if (element.getAttribute(name) !== newValue) {
      element.setAttribute(name, newValue);
    }
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
      while (curNewChild) {
        item = curNewChild.nextSibling;
        if (head) {
          head = makeEqual(head, curNewChild).nextSibling;
        } else {
          parent.appendChild(curNewChild);
        }
        curNewChild = item;
      }
    } else {
      for (let i = 0; i < newL; i++) {
        if (head) head = makeEqual(head, newChildren[i]).nextSibling;else {
          item = newChildren[i];
          parent.appendChild(item.nodeType ? item : createFn(item));
        }
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
          parent.insertBefore(_node, prevEndNode.nextSibling);
          prevEndNode = _node;
          newStart++;
        }
      }
      return;
    }
    const oldKeys = new Array(newEnd + 1 - newStart),
          newKeys = new Map(),
          nodes = [],
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
    if (reusingNodes === 0) {
      for (let i = newStart; i <= newEnd; i++) {
        parent.insertBefore(createFn(newData[i]), prevStartNode);
      }
      for (let i = 0; i < toDelete.length; i++) {
        parent.removeChild(toDelete[i]);
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
    for (let i = 0; i < toDelete.length; i++) {
      parent.removeChild(toDelete[i]);
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
      window.console.log(`Error processing binding: \`${f}\``);
      return '';
    }
  }
  function evaluate(fxn, el) {
    try {
      if (typeof fxn === 'string') return fxn;else return fxn.call(el);
    } catch (e) {
      const str = fxn.toString();
      window.console.log(`Error evaluating: \`${str.slice(str.indexOf('{') + 1, str.lastIndexOf('}'))}\` for element`, el);
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
    if (!element._refs) return false;
    stateMap = stateMap || element.constructor.stateMap;
    let data, dom, newValue;
    const l = element._refs.length;
    for (let i = 0; i < l; i++) {
      data = stateMap[i].ref;
      dom = element._refs[i];
      if (data.type === 0) {
        newValue = element.state[data.text];
        if (dom.data != newValue) dom.data = newValue;
        continue;
      } else if (data.type === 1) {
        newValue = evaluateBindings(data.text, element);
        if (dom.data != newValue) dom.data = newValue;
        continue;
      }
      if (data.attributes) {
        for (let key in data.attributes) {
          if (key !== 'events') {
            if (data.attributes[key].type === 0) {
              newValue = element.state[data.attributes[key].text];
            } else {
              newValue = evaluateBindings(data.attributes[key].text, element);
            }
            updateattribute(dom, key, newValue);
          } else {
            if (!dom._sifrrEventSet) {
              for (let event in data.attributes.events) {
                dom[event] = evaluateBindings(data.attributes.events[event], element);
              }
              dom._root = element;
              dom._sifrrEventSet = true;
            }
          }
        }
      }
      if (data.text === undefined) continue;
      newValue = evaluateBindings(data.text, element);
      if (!newValue || newValue.length === 0) {
        dom.textContent = '';
      }
      if (data.type === 3) {
        let key;
        if (data.keyed && (key = dom.getAttribute(KEY_ATTR))) {
          makeChildrenEqualKeyed$1(dom, newValue, data.se.sifrrClone.bind(data.se), key);
        } else makeChildrenEqual$1(dom, newValue, data.se.sifrrClone.bind(data.se));
      } else {
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
  function SimpleElement(content, defaultState = null) {
    if (!content.nodeType && typeof content !== 'string') {
      if (!content[0] || !content[0].nodeType) {
        throw TypeError('First argument for SimpleElement should be of type string or DOM element');
      }
    }
    const templ = template(content);
    content = templ.content.firstElementChild || templ.content.firstChild;
    if (content.isSifrr || content.nodeName.indexOf('-') !== -1 || content.getAttribute && content.getAttribute('is') && content.getAttribute('is').indexOf('-') !== -1) {
      if (!content.isSifrr) {
        window.document.body.appendChild(content);
        window.document.body.removeChild(content);
      }
      return content;
    }
    const stateMap = create$1(content, creator_1, defaultState);
    function setState(v) {
      Object.assign(this.state, v);
      update_1(this, stateMap);
    }
    content.sifrrClone = function (newState) {
      const clone = content.cloneNode(true);
      clone._refs = collect$1(clone, stateMap, 'nextNode');
      clone.state = Object.assign({}, defaultState, newState);
      clone.setState = setState;
      update_1(clone, stateMap);
      return clone;
    };
    return content;
  }
  var simpleelement = SimpleElement;

  const {
    getBindingFxns
  } = bindings;
  const {
    KEY_ATTR: KEY_ATTR$1
  } = constants;
  var repeatref = (sm, el, attr) => {
    sm.type = 3;
    let defaultState;
    if (el.hasAttribute('data-sifrr-default-state')) defaultState = JSON.parse(el.getAttribute('data-sifrr-default-state'));
    sm.se = simpleelement(el.childNodes, defaultState);
    sm.text = getBindingFxns(el.getAttribute(attr));
    sm.keyed = el.hasAttribute(KEY_ATTR$1);
    el.textContent = '';
    el.removeAttribute(attr);
  };

  const {
    TEXT_NODE: TEXT_NODE$2,
    COMMENT_NODE: COMMENT_NODE$1,
    ELEMENT_NODE,
    REPEAT_ATTR
  } = constants;
  const {
    getBindingFxns: getBindingFxns$1,
    getStringBindingFxn
  } = bindings;
  function creator(el, filter, defaultState) {
    if (el.nodeType === TEXT_NODE$2 || el.nodeType === COMMENT_NODE$1) {
      const x = el.data;
      if (x.indexOf('${') > -1) {
        const binding = getStringBindingFxn(x.trim());
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
      if (filter(el)) {
        const innerHTML = el.innerHTML;
        if (innerHTML.indexOf('${') >= 0) {
          sm.type = 2;
          sm.text = getBindingFxns$1(innerHTML.replace(/<!--((?:(?!-->).)+)-->/g, '$1').trim());
        }
      } else if (el.hasAttribute(REPEAT_ATTR)) {
        repeatref(sm, el, REPEAT_ATTR);
      }
      const attrs = el.attributes,
            l = attrs.length;
      const attrStateMap = {
        events: {}
      };
      for (let i = 0; i < l; i++) {
        const attribute = attrs[i];
        if (attribute.name[0] === '_') {
          attrStateMap.events[attribute.name] = getBindingFxns$1(attribute.value);
        } else if (attribute.value.indexOf('${') >= 0) {
          const binding = getStringBindingFxn(attribute.value);
          if (typeof binding !== 'string') {
            attrStateMap[attribute.name] = {
              type: 1,
              text: binding
            };
          } else {
            attrStateMap[attribute.name] = {
              type: 0,
              text: binding
            };
            if (defaultState) updateattribute(el, attribute.name, defaultState[binding]);
          }
        }
      }
      if (Object.keys(attrStateMap.events).length === 0) delete attrStateMap.events;
      if (Object.keys(attrStateMap).length > 0) sm.attributes = attrStateMap;
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
      this.url = url;
    }
    get html() {
      if (this._html) return this._html;
      Loader.add(this.elementName, this);
      const me = this;
      this._html = window.fetch(this.htmlUrl).then(resp => resp.text()).then(file => template(file).content).then(content => {
        me.template = content.querySelector('template');
        return content;
      });
      return this._html;
    }
    get js() {
      if (this._js) return this._js;
      Loader.add(this.elementName, this);
      this._js = window.fetch(this.jsUrl).then(resp => resp.text());
      return this._js;
    }
    get htmlUrl() {
      return this.url || `${window.Sifrr.Dom.config.baseUrl + '/'}elements/${this.elementName.split('-').join('/')}.html`;
    }
    get jsUrl() {
      return this.url || `${window.Sifrr.Dom.config.baseUrl + '/'}elements/${this.elementName.split('-').join('/')}.js`;
    }
    executeScripts(js) {
      if (this._executed) throw Error(`'${this.elementName}' element's javascript was already executed`);
      this._executed = true;
      if (!js) {
        return this.executeHTMLScripts();
      } else {
        return this.js.then(script => {
          new Function(script + `\n //# sourceURL=${this.jsUrl}`).call();
        }).catch(e => {
          window.console.error(e);
          window.console.log(`JS file for '${this.elementName}' gave error. Trying to get html file.`);
          return this.executeHTMLScripts();
        });
      }
    }
    executeHTMLScripts() {
      return this.html.then(content => {
        content.querySelectorAll('script').forEach(script => {
          if (script.src) {
            const newScript = constants.SCRIPT();
            newScript.src = script.src;
            newScript.type = script.type;
            window.document.body.appendChild(newScript);
          } else {
            new Function(script.text + `\n //# sourceURL=${this.htmlUrl}`).call({
              currentTempate: content.querySelector('template')
            });
          }
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

  const {
    collect: collect$2,
    create: create$2
  } = ref;
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
        if (this._ctemp) return this._ctemp;
        this._ctemp = this.template;
        if (this._ctemp) {
          if (this.useShadowRoot && window.ShadyCSS && !window.ShadyCSS.nativeShadow) {
            window.ShadyCSS.prepareTemplate(this._ctemp, this.elementName);
          }
          this.stateMap = create$2(this._ctemp.content, creator_1, this.defaultState);
        }
        return this._ctemp;
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
          this.state = Object.assign({}, this.constructor.defaultState, this.state);
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
        if (this.__content) {
          this.textContent = '';
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
          this.setState(JSON.parse(newVal));
        }
        this.onAttributeChange(attrName, oldVal, newVal);
      }
      onAttributeChange() {}
      setState(v) {
        if (this.state !== v) Object.assign(this.state, v);
        this.update();
        this.onStateChange();
      }
      onStateChange() {}
      update() {
        update_1(this);
        this.onUpdate();
      }
      onUpdate() {}
      isSifrr(name = null) {
        if (name) return name === this.constructor.elementName;else return true;
      }
      sifrrClone(state) {
        const clone = this.cloneNode(false);
        clone.setState(state);
        return clone;
      }
      clearState() {
        this.state = {};
        this.update();
      }
      $(args, sr = true) {
        if (this.constructor.useShadowRoot && sr) return this.shadowRoot.querySelector(args);else return this.querySelector(args);
      }
      $$(args, sr = true) {
        if (this.constructor.useShadowRoot && sr) return this.shadowRoot.querySelectorAll(args);else return this.querySelectorAll(args);
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
      root = target;
      while (root && !root.isSifrr) root = root.parentNode || root.host;
      if (root) target._root = root;else target._root = null;
    }
    state[target.getAttribute('data-sifrr-bind')] = value;
    if (target._root) target._root.state = state;
  };

  const SYNTHETIC_EVENTS = {};
  const opts = {
    capture: true,
    passive: true
  };
  const nativeToSyntheticEvent = (e, name) => {
    const target = e.composedPath ? e.composedPath()[0] : e.target;
    let dom = target;
    while (dom) {
      const eventHandler = dom[`_${name}`] || (dom.hasAttribute ? dom.getAttribute(`_${name}`) : null);
      if (typeof eventHandler === 'function') {
        eventHandler.call(dom._root || window, e, target);
      } else if (typeof eventHandler === 'string') {
        new Function('event', 'target', eventHandler).call(dom._root || window, event, target);
      }
      cssMatchEvent(e, name, dom, target);
      dom = dom.parentNode || dom.host;
    }
  };
  const cssMatchEvent = (e, name, dom, target) => {
    function callEach(fxns) {
      fxns.forEach(fxn => fxn(e, target, dom));
    }
    Promise.resolve((() => {
      for (let css in SYNTHETIC_EVENTS[name]) {
        if (typeof dom.matches === 'function' && dom.matches(css) || dom.nodeType === 9 && css === 'document') callEach(SYNTHETIC_EVENTS[name][css]);
      }
    })());
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
  SifrrDom.twoWayBind = twowaybind;
  SifrrDom.Loader = loader;
  SifrrDom.SimpleElement = simpleelement;
  SifrrDom.Event = event_1;
  SifrrDom.makeChildrenEqual = makeequal.makeChildrenEqual;
  SifrrDom.makeChildrenEqualKeyed = keyed.makeChildrenEqualKeyed;
  SifrrDom.makeEqual = makeequal.makeEqual;
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
    SifrrDom.Event.addListener('input', 'document', SifrrDom.twoWayBind);
    SifrrDom.Event.addListener('change', 'document', SifrrDom.twoWayBind);
  };
  SifrrDom.load = function (elemName, {
    url,
    js = true
  } = {}) {
    if (window.customElements.get(elemName)) {
      return Promise.resolve(window.console.warn(`Error loading Element: ${elemName} - Custom Element with this name is already defined.`));
    }
    let loader = new SifrrDom.Loader(elemName, url);
    const wd = customElements.whenDefined(elemName);
    SifrrDom.loadingElements.push(wd);
    return loader.executeScripts(js).then(() => {
      if (!window.customElements.get(elemName)) {
        window.console.warn(`Executing '${elemName}' file didn't register the element. Ignore if you are registering element in a promise or async function.`);
        SifrrDom.loadingElements.splice(SifrrDom.loadingElements.indexOf(wd), 1);
      }
    }).catch(e => {
      SifrrDom.loadingElements.splice(SifrrDom.loadingElements.indexOf(wd), 1);
      throw e;
    });
  };
  SifrrDom.loading = () => {
    return Promise.all(SifrrDom.loadingElements);
  };
  var sifrr_dom = SifrrDom;

  return sifrr_dom;

}));
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.dom.js.map
