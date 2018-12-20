const { collect, create } = require('./ref');
const compilerTemplate = document.createElement('template');

// Based on https://github.com/Freak613/stage0/blob/master/index.js
function collector(node) {
  if (node.nodeType !== 3) {
    if (node.attributes !== undefined) {
      const attrs = Array.from(node.attributes), l = attrs.length;
      const ret = [];
      for(let i = 0; i < l; i++) {
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
  const refs = simpleEl._refs, l = refs.length;
  const newState = simpleEl.state, oldState = simpleEl._oldState;
  for (let i = 0; i < l; i++) {
    const data = refs[i].data, dom = refs[i].dom;
    if (Array.isArray(data)) {
      const l = data.length;
      for (let i = 0; i < l; i++) {
        const attr = data[i];
        if (oldState[attr.text] != newState[attr.text]) dom.setAttribute(attr.name, newState[attr.text]);
      }
    } else {
      if (oldState[data] != newState[data]) dom.nodeValue = newState[data];
    }
  }
}

function SimpleElement(content, defaultState) {
  if (typeof content === 'string') {
    compilerTemplate.innerHTML = content;
    content = compilerTemplate.content.firstChild;
  }
  content.stateMap = create(content, collector);
  content._refs = collect(content, content.stateMap);
  Object.defineProperty(content, 'state', {
    get: () => content._state,
    set: (v) => {
      content._oldState = Object.assign({}, content._state);
      content._state = Object.assign(content._state || {}, v);
      updateState(content);
    }
  });
  if (defaultState) content.state = defaultState;

  content.sifrrClone = function(deep) {
    const clone = content.cloneNode(deep);
    clone._refs = collect(clone, content.stateMap);
    Object.defineProperty(clone, 'state', {
      get: () => clone._state,
      set: (v) => {
        clone._oldState = Object.assign({}, clone._state);
        clone._state = Object.assign(clone._state || {}, v);
        updateState(clone);
      }
    });
    if (defaultState) clone.state = defaultState;
    return clone;
  };

  return content;
}

module.exports = SimpleElement;
