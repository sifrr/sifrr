const { makeChildrenEqual } = require('./makeequal');
const updateAttribute = require('./updateattribute');
const { evaluateString } = require('./parser');
const TEMPLATE = require('./constants').TEMPLATE();

function simpleElementUpdate(simpleEl) {
  const doms = simpleEl._refs, refs = simpleEl.stateMap, l = refs.length;
  for (let i = 0; i < l; i++) {
    const data = refs[i].ref, dom = doms[i];
    if (Array.isArray(data)) {
      const l = data.length;
      for (let i = 0; i < l; i++) {
        const attr = data[i];
        if (attr.name === 'class') dom.className = simpleEl.state[attr.text];
        else dom.setAttribute(attr.name, simpleEl.state[attr.text]);
      }
    } else {
      dom.data = simpleEl.state[data];
    }
  }
}

function customElementUpdate(element) {
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
            const eventLis = evaluateString(data.attributes.events[event], element);
            dom[event] = eventLis;
          }
          dom._root = element;
          delete data.attributes['events'];
        } else {
          const val = evaluateString(data.attributes[key], element);
          updateAttribute(dom, key, val);
        }
      }
    }

    if (data.html === undefined) continue;

    // update element
    const newValue = evaluateString(data.text, element);
    if (!newValue) { dom.textContent = ''; continue; }

    if (data.html) {
      // html node
      let children;
      if (Array.isArray(newValue)) {
        children = newValue;
      } else if (newValue.content && newValue.content.nodeType === 11) {
        children = Array.prototype.slice.call(newValue.content.childNodes);
      } else if (newValue.nodeType) {
        children = [newValue];
      } else if (typeof newValue === 'string') {
        TEMPLATE.innerHTML = newValue.toString();
        children = Array.prototype.slice.call(TEMPLATE.content.childNodes);
      } else {
        children = Array.prototype.slice.call(newValue);
      }
      if (children.length === 0) {
        dom.textContent = '';
        continue;
      }
      makeChildrenEqual(dom, children);
    } else {
      // text node
      if (dom.data != newValue) {
        dom.data = newValue;
      }
    }
  }
  element.onUpdate();
}

module.exports = {
  update: customElementUpdate,
  simpleUpdate: simpleElementUpdate
};
