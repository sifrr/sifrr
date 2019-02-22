const { collect, create, collectSimple } = require('./ref');
const { creator } = require('./creator');

const Parser = {
  collectRefs: collect,
  collectRefsSimple: collectSimple,
  createStateMap: (element, isSifrrElement) => create(element, creator, isSifrrElement),
  twoWayBind: (e) => {
    const target = e.composedPath ? e.composedPath()[0] : e.target;
    if (!target.hasAttribute('data-sifrr-bind') || target._root === null) return;
    const value = target.value || target.textContent;
    let state = {};
    if (!target._root) {
      let root;
      root = target;
      while(root && !root.isSifrr) root = root.parentNode || root.host;
      if (root) target._root = root;
      else target._root = null;
    }
    state[target.getAttribute('data-sifrr-bind')] = value;
    if (target._root) target._root.state = state;
  }
};

module.exports = Parser;
