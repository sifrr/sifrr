const { ELEMENT_NODE } = require('./constants');

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

module.exports = {
  simpleCreator: simpleElementCreator
};
