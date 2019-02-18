const { collect, create } = require('./ref');
const { creator } = require('./creator');

function isHtml(el) {
  return (el.dataset && el.dataset.sifrrHtml == 'true') ||
    (el.dataset && el.dataset.sifrrRepeat);
}

const Parser = {
  collectRefs: (el, stateMap) => collect(el, stateMap, isHtml),
  createStateMap: (element) => create(element, creator, isHtml),
  twoWayBind: (e) => {
    /* istanbul ignore next */
    const target = e.composedPath ? e.composedPath()[0] : e.target;
    if (!target.dataset.sifrrBind || target._root === null) return;
    const value = target.value || target.textContent;
    let state = {};
    if (!target._root) {
      let root;
      root = target;
      while(root && !root.isSifrr) root = root.parentNode || root.host;
      if (root) target._root = root;
      else target._root = null;
    }
    state[target.dataset.sifrrBind] = value;
    if (target._root) target._root.state = state;
  }
};

module.exports = Parser;
