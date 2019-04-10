const simpleElement = require('./simpleelement');
const { getStringBindingFxn } = require('./bindings');
const { KEY_ATTR, REPEAT_ATTR } = require('./constants');

module.exports = (sm, el) => {
  sm.type = 3;
  let defaultState;
  if (el.hasAttribute('data-sifrr-default-state')) defaultState = JSON.parse(el.getAttribute('data-sifrr-default-state'));
  sm.se = simpleElement(el.childNodes, defaultState);
  sm.text = getStringBindingFxn(el.getAttribute(REPEAT_ATTR));
  sm.keyed = el.hasAttribute(KEY_ATTR);
  el.removeAttribute(REPEAT_ATTR);
};
