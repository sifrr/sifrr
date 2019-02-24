const simpleElement = require('./simpleelement');
const { getBindingFxns } = require('./bindings');

module.exports = (sm, el, attr) => {
  sm.type = 3;
  sm.se = simpleElement(el.childNodes);
  sm.text = getBindingFxns(el.getAttribute(attr));
  el.textContent = '';
  el.removeAttribute(attr);
};
