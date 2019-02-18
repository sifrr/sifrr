const { makeChildrenEqual } = require('./makeequal');
const updateAttribute = require('./updateattribute');
const { evaluateBindings } = require('./bindings');
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
            const eventLis = evaluateBindings(data.attributes.events[event], element);
            dom[event] = eventLis;
          }
          dom._root = element;
          delete data.attributes['events'];
        } else {
          const val = evaluateBindings(data.attributes[key], element);
          updateAttribute(dom, key, val);
        }
      }
    }

    if (data.html === undefined) continue;

    // update element
    const newValue = evaluateBindings(data.text, element);
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
