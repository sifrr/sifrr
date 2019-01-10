const { makeChildrenEqual } = require('./makeequal');
const { updateAttribute } = require('./update');
const { collect, create } = require('./ref');
const { TEMPLATE, TEXT_NODE, COMMENT_NODE, ELEMENT_NODE } = require('./constants');

function isHtml(el) {
  return (el.dataset && el.dataset.sifrrHtml == 'true') ||
    el.contentEditable == 'true' ||
    el.nodeName == 'TEXTAREA' ||
    el.nodeName == 'STYLE' ||
    (el.dataset && el.dataset.sifrrRepeat);
}

function creator(el) {
  if (el.nodeType === TEXT_NODE || el.nodeType === COMMENT_NODE) {
    // text node
    const x = el.nodeValue;
    if (x.indexOf('${') > -1) return {
      html: false,
      text: x.trim()
    };
  } else if (el.nodeType === ELEMENT_NODE) {
    const sm = {};
    // Html ?
    if (isHtml(el)) {
      const innerHTML = el.innerHTML;
      if (innerHTML.indexOf('${') >= 0) {
        sm.html = true;
        sm.text = innerHTML.replace(/<!--(.*)-->/g, '$1');
      }
    }
    // attributes
    const attrs = el.attributes || [], l = attrs.length;
    const attrStateMap = { events: {} };
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
  collectRefs: (el, stateMap) => collect(el, stateMap, isHtml),
  createStateMap: (element) => create(element, creator, isHtml),
  update: (element) => {
    if (!element._refs) {
      return false;
    }
    // Update nodes
    const l = element._refs.length;
    for (let i = 0; i < l; i++) {
      const data = element.constructor.stateMap[i].ref;
      const dom = element._refs[i];

      // update attributes
      if (data.attributes) {
        for(let key in data.attributes) {
          if (key === 'events') {
            for(let event in data.attributes.events) {
              dom[event] = Parser.evaluateString(data.attributes.events[event], element);
            }
          } else {
            const val = Parser.evaluateString(data.attributes[key], element);
            updateAttribute(dom, key, val);
          }
        }
      }

      if (data.html === undefined) continue;

      // update element
      const newValue = Parser.evaluateString(data.text, element);
      if (!newValue) { dom.textContent = ''; continue; }

      if (data.html) {
        // html node
        let children;
        if (Array.isArray(newValue)) {
          children = newValue;
        } else if (newValue.nodeType) {
          children = [newValue];
        } else {
          // Replace html tags in input from input/contenteditable/textarea
          TEMPLATE.innerHTML = newValue.toString()
            // All closing tags
            .replace(/(&lt;)(((?!&gt;).)*)(&gt;)(((?!&lt;).)*)(&lt;)\/(((?!&gt;).)*)(&gt;)/g, '<$2>$5</$8>')
            // Self closing tags (void elements) from https://html.spec.whatwg.org/multipage/syntax.html#void-elements
            .replace(/(&lt;)(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)(((?!&gt;).)*)(&gt;)/g, '<$2$3>');
          children = Array.prototype.slice.call(TEMPLATE.content.childNodes);
        }
        if (children.length < 1) dom.textContent = '';
        else makeChildrenEqual(dom, children);
      } else {
        // text node
        if (dom.nodeValue != newValue) {
          dom.nodeValue = newValue;
        }
      }
    }
  },
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
      while(!root.isSifrr) root = target.parentNode || target.host;
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

module.exports = Parser;
