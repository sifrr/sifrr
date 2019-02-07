const { TEXT_NODE, ELEMENT_NODE, COMMENT_NODE } = require('./constants');

// Inspired by https://github.com/Freak613/stage0/blob/master/index.js
function creator(el, isHtml = false) {
  if (el.nodeType === TEXT_NODE || el.nodeType === COMMENT_NODE) {
    // text node
    const x = el.nodeValue;
    if (x.indexOf('${') > -1) return {
      html: false,
      text: x.trim()
    };
  } else if (el.nodeType === ELEMENT_NODE) {
    const sm = {};
    // Html ?
    if (isHtml) {
      const innerHTML = el.innerHTML;
      if (innerHTML.indexOf('${') >= 0) {
        sm.html = true;
        sm.text = innerHTML.replace(/<!--(.*)-->/g, '$1');
      }
    }
    // attributes
    const attrs = el.attributes || [], l = attrs.length;
    const attrStateMap = { events: {} };
    for (let i = 0; i < l; i++) {
      const attribute = attrs[i];
      if (attribute.name[0] === '$') {
        attrStateMap.events[attribute.name] = attribute.value;
      } else if (attribute.value.indexOf('${') >= 0) {
        if (attribute.name === 'style') {
          const styles = {};
          attribute.value.split(';').forEach((s) => {
            const [n, v] = s.split(/:(?!\/\/)/);
            if (n && v && v.indexOf('${') >= 0) {
              styles[n.trim()] = v.trim();
            }
          });
          attrStateMap[attribute.name] = styles;
        } else {
          attrStateMap[attribute.name] = attribute.value;
        }
      }
    }
    if (Object.keys(attrStateMap.events).length === 0) delete attrStateMap.events;
    if (Object.keys(attrStateMap).length > 0) sm.attributes = attrStateMap;

    if (Object.keys(sm).length > 0) return sm;
  }
  return 0;
}

module.exports = {
  creator
};
