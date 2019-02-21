const { makeChildrenEqual } = require('../makeequal');
const { makeChildrenEqualKeyed } = require('../keyed');
const updateAttribute = require('./updateattribute');
const { evaluateBindings } = require('../bindings');
const { TEMPLATE, KEY_ATTR } = require('../constants');

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

    if (data.text === undefined) continue;

    // update element
    const newValue = evaluateBindings(data.text, element);

    if (data.type === 2) {
      const key = dom.getAttribute(KEY_ATTR);
      if (key) makeChildrenEqualKeyed(dom, newValue, (state) => data.se.sifrrClone(true, state), key);
      else makeChildrenEqual(dom, newValue, (state) => data.se.sifrrClone(true, state));
    } else if (data.type === 1) {
      // html node
      let children;
      if (Array.isArray(newValue)) {
        children = newValue;
      } else if (newValue.content && newValue.content.nodeType === 11) {
        children = Array.prototype.slice.call(newValue.content.childNodes);
      } else if (newValue.nodeType) {
        children = [newValue];
      } else if (typeof newValue === 'string') {
        const temp = TEMPLATE();
        temp.innerHTML = newValue.toString();
        children = Array.prototype.slice.call(temp.content.childNodes);
      } else {
        children = Array.prototype.slice.call(newValue);
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

module.exports = customElementUpdate;
