const { TEXT_NODE, COMMENT_NODE, ELEMENT_NODE } = require('./constants');
const { getBindingFxn, getBindingFxns } = require('./bindings');

// Inspired from https://github.com/Freak613/stage0/blob/master/reuseNodes.js
function simpleElementCreator(node) {
  if (node.nodeType === ELEMENT_NODE) {
    const attrs = Array.prototype.slice.call(node.attributes), l = attrs.length;
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
    return 0;
  } else {
    let nodeData = node.data;
    if (nodeData[0] === '$') {
      node.data = '';
      return nodeData.slice(2, -1);
    }
    return 0;
  }
}

function customElementCreator(el, filter) {
  if (el.nodeType === TEXT_NODE || el.nodeType === COMMENT_NODE) {
    // text node
    const x = el.data;
    if (x.indexOf('${') > -1) return {
      html: false,
      text: x.trim()
    };
  } else if (el.nodeType === ELEMENT_NODE) {
    const sm = {};
    // Html ?
    if (filter(el)) {
      const innerHTML = el.innerHTML;
      if (innerHTML.indexOf('${') >= 0) {
        sm.html = true;
        sm.text = innerHTML.replace(/<!--(.*)-->/g, '$1').trim();
      }
    }
    // attributes
    const attrs = el.attributes, l = attrs.length;
    const attrStateMap = { events: {} };
    for (let i = 0; i < l; i++) {
      const attribute = attrs[i];
      if (attribute.name[0] === '_') {
        attrStateMap.events[attribute.name] = attribute.value;
      } else if (attribute.value.indexOf('${') >= 0) {
        // Don't treat style differently because same performance https://jsperf.com/style-property-vs-style-attribute/2
        attrStateMap[attribute.name] = attribute.value;
      }
    }
    if (Object.keys(attrStateMap.events).length === 0) delete attrStateMap.events;
    if (Object.keys(attrStateMap).length > 0) sm.attributes = attrStateMap;

    if (Object.keys(sm).length > 0) return sm;
  }
  return 0;
}

module.exports = {
  creator: customElementCreator,
  simpleCreator: simpleElementCreator
};
