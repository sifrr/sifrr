const simpleElement = require('./simpleelement');
const { getStringBindingFxn } = require('./bindings');
const { KEY_ATTR, REPEAT_ATTR, DEFAULT_STATE_ATTR } = require('./constants');

module.exports = (sm, el) => {
  sm.type = 3;
  let defaultState;
  if (el.hasAttribute(DEFAULT_STATE_ATTR))
    defaultState = JSON.parse(el.getAttribute(DEFAULT_STATE_ATTR));
  sm.se = simpleElement(el.childNodes, defaultState);
  sm.text = getStringBindingFxn(el.getAttribute(REPEAT_ATTR));
  sm.keyed = el.hasAttribute(KEY_ATTR);
  el.removeAttribute(REPEAT_ATTR);
};
