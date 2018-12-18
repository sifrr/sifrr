const { makeChildrenEqual } = require('./makeequal');
// based on https://github.com/Freak613/stage0/blob/master/index.js
const TREE_WALKER = window.document.createTreeWalker(document, NodeFilter.SHOW_ALL, null, false);
TREE_WALKER.roll = function(n) {
  let tmp;
  while(--n) tmp = this.nextNode();
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
  collectRefs: function(element, stateMap) {
    const refs = [];
    const w = TREE_WALKER;
    w.currentNode = element;
    stateMap.map(x => refs.push({
      dom: w.roll(x.idx),
      data: x.ref
    }));
    return refs;
  },
  createStateMap: function(element) {
    let node;
    if (element.useShadowRoot) node = element.shadowRoot;
    else node = element;

    let indices = [], ref, idx = 0;
    TREE_WALKER.currentNode = node;
    do {
      if (ref = collector(node)) {
        indices.push(new Ref(idx+1, ref));
        idx = 1;
      } else {
        idx++;
      }
    } while(node = TREE_WALKER.nextNode());

    // return indices;
    function collector(el) {
      if (el.nodeType === window.Node.TEXT_NODE) {
        // text node
        const textStateMap = Parser.createTextStateMap(el);
        if (textStateMap) return textStateMap;
      } else if (el.nodeType === window.Node.COMMENT_NODE && el.nodeValue.trim()[0] == '$') {
        // comment
        return {
          html: false,
          text: el.nodeValue.trim()
        };
      } else if (el.nodeType === window.Node.ELEMENT_NODE) {
        let ref = {};
        // Html ?
        if ((el.dataset && el.dataset.sifrrHtml == 'true') || el.contentEditable == 'true' || el.nodeName == 'TEXTAREA' || el.nodeName == 'STYLE') {
          ref.html = true;
          ref.text = el.innerHTML.replace(/<!--(.*)-->/g, '$1');
        }
        // attributes
        const attrStateMap = Parser.createAttributeStateMap(el);
        if (attrStateMap) ref.attributes = attrStateMap;

        if (Object.keys(ref).length > 0) return ref;
      }
    }
    return indices;
  },
  createTextStateMap: function(textElement) {
    const x = textElement.nodeValue;
    if (x.indexOf('${') > -1) {
      // data-sifrr-html='true' or contenteditable or textarea or style
      if ((textElement.parentNode.dataset && textElement.parentNode.dataset.sifrrHtml == 'true') || textElement.parentNode.contentEditable == 'true' || textElement.parentNode.nodeName == 'TEXTAREA' || textElement.parentNode.nodeName == 'STYLE') {
        return ;
      } else {
        return {
          html: false,
          text: x
        };
      }
    }
  },
  createAttributeStateMap: function(element) {
    const attrs = element.attributes || [], l = attrs.length;
    let attributes = {};
    for(let i = 0; i < l; i++) {
      const attribute = attrs[i];
      if (attribute.value.indexOf('${') > -1) {
        attributes[attribute.name] = attribute.value;
      }
    }
    if (Object.keys(attributes).length > 0) return attributes;
  },
  twoWayBind: function(e) {
    const target = e.path ? e.path[0] : e.target;
    if (!target.dataset.sifrrBind) return;
    const value = target.value === undefined ? target.innerHTML : target.value;
    let data = {};
    data[target.dataset.sifrrBind] = value;
    target.getRootNode().host.state = data;
  },
  updateState: function(element) {
    if (!element._refs) {
      return false;
    }

    // Update nodes
    const l = element._refs.length;
    for (let i = 0; i < l; i++) {
      Parser.updateNode(element._refs[i], element);
    }

    if (typeof this.onStateUpdate === 'function') this.onStateUpdate();
  },
  updateNode: function(ref, base) {
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
        docFrag.innerHTML = newHTML.toString()
          .replace(/&amp;/g, '&')
          .replace(/&nbsp;/g, ' ')
          .replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>')
          .replace(/(&lt;)(input|link|img|br|hr|col|keygen)(((?!&gt;).)*)(&gt;)/g, '<$2$3>');
        children = docFrag.childNodes;
      }
      makeChildrenEqual(ref.dom, children);
    } else {
      if (ref.dom.textContent == newHTML) return;
      ref.dom.textContent = newHTML;
    }
  },
  updateAttribute: function(ref, base) {
    const element = ref.dom;
    for(let key in ref.data.attributes) {
      const val = Parser.evaluateString(ref.data.attributes[key], base);
      if (val === 'null' || val === 'undefined' || val === 'false' || !val) {
        element.removeAttribute(key);
      } else {
        const oldVal = element.getAttribute(key);
        if (oldVal != val) element.setAttribute(key, val);
      }

      // select's value doesn't change on changing value attribute
      if (element.nodeName == 'SELECT' && key == 'value') element.value = val;
    }
  },
  evaluateString: function(string, element) {
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

module.exports = Parser;
