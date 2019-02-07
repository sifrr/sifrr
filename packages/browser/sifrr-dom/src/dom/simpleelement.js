const { collect, create } = require('./ref');
const template = require('./template');

// Inspired from https://github.com/Freak613/stage0/blob/master/index.js
function creator(node) {
  if (node.nodeType !== 3) {
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
    let nodeData = node.nodeValue;
    if (nodeData[0] === '$') {
      node.nodeValue = '';
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
      if (oldState[data] != newState[data]) dom.nodeValue = newState[data];
    }
  }
}

const setupEl = (el, baseState, baseEl) => {
  const state = el.state || baseEl ? baseEl.state : baseState;
  el.stateMap = baseEl ? baseEl.stateMap : create(el, creator);
  el._refs = collect(el, el.stateMap);
  Object.defineProperty(el, 'state', {
    get: () => el._state,
    set: (v) => {
      el._oldState = Object.assign({}, el._state);
      el._state = Object.assign(el._state || {}, v);
      updateState(el);
    }
  });
  if (state) el.state = state;
};

function SimpleElement(content, defaultState) {
  if (typeof content === 'string') {
    const templ = template(content);
    content = templ.content.firstElementChild || templ.content.firstChild;
  } else if (!content.nodeType) {
    throw TypeError('First argument for SimpleElement should be of type string or DOM element');
  }
  if (content.nodeName.indexOf('-') !== -1 ||
    (content.getAttribute && content.getAttribute('is') && content.getAttribute('is').indexOf('-') >= 0) ||
    // for document.createElement('tag', { is: 'custom-element' })
    content.isSifrr) return content;
  setupEl(content, defaultState);

  content.sifrrClone = function(deep = true) {
    const clone = content.cloneNode(deep);
    setupEl(clone, defaultState, content);
    return clone;
  };

  return content;
}

module.exports = SimpleElement;
