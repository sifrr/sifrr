const { TEXT_NODE, COMMENT_NODE, ELEMENT_NODE, REPEAT_ATTR } = require('./constants');
const simpleElement = require('./simpleelement');
// ref types:
// 0: text
// 1: html
// 2: arrayToDom
const { getBindingFxns } = require('./bindings');

function customElementCreator(el, filter) {
  if (el.nodeType === TEXT_NODE || el.nodeType === COMMENT_NODE) {
    // text node
    const x = el.data;
    if (x.indexOf('${') > -1) return {
      type: 0,
      text: getBindingFxns(x.trim())
    };
  } else if (el.nodeType === ELEMENT_NODE) {
    const sm = {};
    // Html ?
    if (filter(el)) {
      const innerHTML = el.innerHTML;
      if (innerHTML.indexOf('${') >= 0) {
        sm.type = 1;
        sm.text = getBindingFxns(innerHTML.replace(/<!--((?:(?!-->).)+)-->/g, '$1').trim());
      }
    } else if (el.hasAttribute(REPEAT_ATTR)) {
      sm.type = 2;
      sm.se = simpleElement(el.childNodes);
      sm.text = getBindingFxns(el.getAttribute(REPEAT_ATTR));
      el.removeAttribute(REPEAT_ATTR);
      el.textContent = '';
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

module.exports = {
  creator: customElementCreator
};
