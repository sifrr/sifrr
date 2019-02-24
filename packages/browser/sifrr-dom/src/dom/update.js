const { makeChildrenEqual } = require('./makeequal');
const { makeChildrenEqualKeyed } = require('./keyed');
const updateAttribute = require('./updateattribute');
const { evaluateBindings } = require('./bindings');
const { TEMPLATE, KEY_ATTR } = require('./constants');

function customElementUpdate(element, stateMap) {
  if (!element._refs) {
    return false;
  }
  stateMap = stateMap || element.constructor.stateMap;
  let data, dom, newValue;
  // Update nodes
  const l = element._refs.length;
  for (let i = 0; i < l; i++) {
    data = stateMap[i].ref;
    dom = element._refs[i];

    // Fast path for text nodes
    if (data.type === 0) {
      // state node
      newValue = element.state[data.text];
      if (dom.data != newValue) dom.data = newValue;
      continue;
    } else if (data.type === 1) {
      // text node
      newValue = evaluateBindings(data.text, element);
      if (dom.data != newValue) dom.data = newValue;
      continue;
    }

    // update attributes
    if (data.attributes) {
      for(let key in data.attributes) {
        if (key !== 'events') {
          const val = evaluateBindings(data.attributes[key], element);
          updateAttribute(dom, key, val);
        } else {
          if (!dom._sifrrEventSet) {
            for(let event in data.attributes.events) {
              dom[event] = evaluateBindings(data.attributes.events[event], element);
            }
            dom._root = element;
            dom._sifrrEventSet = true;
          }
        }
      }
    }

    if (data.text === undefined) continue;

    // update element
    newValue = evaluateBindings(data.text, element);

    if (data.type === 3) {
      // repeat
      const key = dom.getAttribute(KEY_ATTR);
      if (key) makeChildrenEqualKeyed(dom, newValue, (state) => data.se.sifrrClone(true, state), key);
      else makeChildrenEqual(dom, newValue, (state) => data.se.sifrrClone(true, state));
    } else {
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
    }
  }
  if (element.onUpdate) element.onUpdate();
}

module.exports = customElementUpdate;
