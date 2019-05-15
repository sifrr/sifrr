const { TEXT_NODE, COMMENT_NODE, ELEMENT_NODE, HTML_ATTR, REPEAT_ATTR } = require('./constants');
const repeatref = require('./repeatref');
// ref types:
// 0: state
// 1: text
// 2: html
// 3: arrayToDom
const { getBindingFxns, getStringBindingFxn } = require('./bindings');
const updateAttribute = require('./updateattribute');

function creator(el, defaultState) {
  if (el.nodeType === TEXT_NODE || el.nodeType === COMMENT_NODE) {
    const x = el.data;
    if (x.indexOf('${') > -1) {
      const binding = getStringBindingFxn(x.trim());
      if (typeof binding !== 'string') {
        // text node
        return {
          type: 1,
          text: binding
        };
      } else {
        if (defaultState) el.data = el.__data = defaultState[binding];
        // state node
        return {
          type: 0,
          text: binding
        };
      }
    }
  } else if (el.nodeType === ELEMENT_NODE) {
    const sm = {};
    // Html ?
    if (el.hasAttribute(HTML_ATTR)) {
      const innerHTML = el.innerHTML;
      if (innerHTML.indexOf('${') > -1) {
        sm.type = 2;
        sm.text = getBindingFxns(innerHTML.replace(/<!--((?:(?!-->).)+)-->/g, '$1').trim());
      }
      el.textContent = '';
    } else if (el.hasAttribute(REPEAT_ATTR)) {
      repeatref(sm, el);
    }
    // attributes
    const attrs = el.attributes, l = attrs.length;
    const attrStateMap = [];
    const eventMap = [];
    for (let i = 0; i < l; i++) {
      const attribute = attrs[i];
      if (attribute.name[0] === '_' && attribute.value.indexOf('${') > -1) {
        // state binding
        if (attribute.name === '_state') eventMap.__sb = getBindingFxns(attribute.value);
        // Array contents -> 0: name, 1: binding
        else eventMap.push([attribute.name, getBindingFxns(attribute.value)]);
      } else if (attribute.value.indexOf('${') > -1) {
        // Don't treat style differently because same performance https://jsperf.com/style-property-vs-style-attribute/2
        const binding = getStringBindingFxn(attribute.value);
        // Array contents -> 0: name, 1: type, 2: binding
        if (typeof binding !== 'string') {
          // text attr
          attrStateMap.push([attribute.name, 1, binding]);
        } else {
          // state attr
          attrStateMap.push([attribute.name, 0, binding]);
          if (defaultState) updateAttribute(el, attribute.name, defaultState[binding]);
        }
      }
    }
    if (eventMap.length > 0 || eventMap.__sb) sm.events = eventMap;
    if (attrStateMap.length > 0) sm.attributes = attrStateMap;

    if (Object.keys(sm).length > 0) return sm;
  }
  return 0;
}

module.exports = creator;
