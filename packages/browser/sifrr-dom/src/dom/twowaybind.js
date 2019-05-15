const { BIND_ATTR } = require('./constants');
const { shallowEqual } = require('../utils/json');

module.exports = (e) => {
  const target = e.composedPath ? e.composedPath()[0] : e.target;
  if (!target.hasAttribute(BIND_ATTR) || target._root === null) return;
  const value = target.value || target._state || target.textContent;
  if (target.firstChild) target.firstChild.__data = value;
  if (!target._root) {
    let root = target.parentNode;
    while(root && !root.isSifrr) root = root.parentNode || root.host;
    if (root) target._root = root;
    else target._root = null;
  }
  const prop = target.getAttribute(BIND_ATTR);
  if ((e.type !== 'update' || target._sifrrEventSet) && target._root && !shallowEqual(value, target._root._state[prop])) {
    target._root._state[prop] = value;
    target._root.update();
  }
};
