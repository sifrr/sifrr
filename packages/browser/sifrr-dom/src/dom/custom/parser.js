const { collect, create } = require('../ref');
const { creator } = require('./creator');
const { ELEMENT_NODE, HTML_ATTR } = require('../constants');

function isHtml(el) {
  return el.nodeType === ELEMENT_NODE && el.hasAttribute(HTML_ATTR);
}

const Parser = {
  collectRefs: (el, stateMap) => collect(el, stateMap, isHtml),
  createStateMap: (element) => create(element, creator, isHtml),
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
