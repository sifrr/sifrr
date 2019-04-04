const simpleElement = require('./simpleelement');
const { getBindingFxns } = require('./bindings');
const { KEY_ATTR } = require('./constants');

module.exports = (sm, el, attr) => {
  sm.type = 3;
  let defaultState;
  if (el.hasAttribute('data-sifrr-default-state')) defaultState = JSON.parse(el.getAttribute('data-sifrr-default-state'));
  sm.se = simpleElement(el.childNodes, defaultState);
  sm.text = getBindingFxns(el.getAttribute(attr));
  sm.keyed = el.hasAttribute(KEY_ATTR);
  el.removeAttribute(attr);
};
