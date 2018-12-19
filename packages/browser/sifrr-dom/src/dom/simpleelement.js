const { collect, create } = require('./ref');
const compilerTemplate = document.createElement('template');

function collector(node) {
  if (node.nodeType !== 3) {
    if (node.attributes !== undefined) {
      const attrs = Array.from(node.attributes);
      for(let attr of attrs) {
        const avalue = attr.value;
        if (avalue[0] === '$') {
          return {
            type: 'attr',
            text: avalue.slice(2, -1),
            name: attr.name
          };
        }
      }
    }
    return 0;
  } else {
    let nodeData = node.nodeValue;
    if (nodeData[0] === '$') {
      node.nodeValue = '';
      return {
        type: 'text',
        text: nodeData.slice(2, -1)
      };
    }
    return 0;
  }
}

function updateState(simpleEl) {
  const refs = simpleEl._refs, l = refs.length;
  for (let i = 0; i < l; i++) {
    const data = refs[i].data, dom = refs[i].dom;
    if (data.type == 'attr') {
      dom.setAttribute(data.name, simpleEl.state[data.text]);
    } else if (data.type == 'text') {
      dom.nodeValue = simpleEl.state[data.text];
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
      content._state = Object.assign(content._state || {}, v);
      updateState(content);
    }
  });
  if (defaultState) content.state = defaultState;

  content.clone = function() {
    const clone = content.cloneNode(true);
    clone._refs = collect(clone, content.stateMap);
    Object.defineProperty(clone, 'state', {
      get: () => clone._state,
      set: (v) => {
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
