const { TEXT_NODE, COMMENT_NODE, ELEMENT_NODE, REPEAT_ATTR } = require('./constants');
const repeatref = require('./repeatref');
// ref types:
// 0: state
// 1: text
// 2: html
// 3: arrayToDom
const { getBindingFxns, getStringBindingFxn } = require('./bindings');

function customElementCreator(el, filter) {
  if (el.nodeType === TEXT_NODE || el.nodeType === COMMENT_NODE) {
    // text node
    const x = el.data;
    if (x.indexOf('${') > -1) {
      const binding = getStringBindingFxn(x.trim());
      if (typeof binding !== 'string') {
        return {
          type: 1,
          text: binding
        };
      } else {
        return {
          type: 0,
          text: binding
        };
      }
    }
  } else if (el.nodeType === ELEMENT_NODE) {
    const sm = {};
    // Html ?
    if (filter(el)) {
      const innerHTML = el.innerHTML;
      if (innerHTML.indexOf('${') >= 0) {
        sm.type = 2;
        sm.text = getBindingFxns(innerHTML.replace(/<!--((?:(?!-->).)+)-->/g, '$1').trim());
      }
    } else if (el.hasAttribute(REPEAT_ATTR)) {
      repeatref(sm, el, REPEAT_ATTR);
    }
    // attributes
    const attrs = el.attributes, l = attrs.length;
    const attrStateMap = { events: {} };
    for (let i = 0; i < l; i++) {
      const attribute = attrs[i];
      if (attribute.name[0] === '_') {
        attrStateMap.events[attribute.name] = getBindingFxns(attribute.value);
      } else if (attribute.value.indexOf('${') >= 0) {
        // Don't treat style differently because same performance https://jsperf.com/style-property-vs-style-attribute/2
        attrStateMap[attribute.name] = getBindingFxns(attribute.value);
      }
    }
    if (Object.keys(attrStateMap.events).length === 0) delete attrStateMap.events;
    if (Object.keys(attrStateMap).length > 0) sm.attributes = attrStateMap;

    if (Object.keys(sm).length > 0) return sm;
  }
  return 0;
}

module.exports = customElementCreator;
