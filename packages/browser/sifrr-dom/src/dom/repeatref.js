const simpleElement = require('./simpleelement');
const { getBindingFxns } = require('./bindings');

module.exports = (sm, el, attr) => {
  sm.type = 3;
  let defaultState;
  if (el.hasAttribute('data-sifrr-default-state')) defaultState = JSON.parse(el.getAttribute('data-sifrr-default-state'));
  sm.se = simpleElement(el.childNodes, defaultState);
  sm.text = getBindingFxns(el.getAttribute(attr));
  el.textContent = '';
  el.removeAttribute(attr);
};
