module.exports = (e) => {
  const target = e.composedPath ? e.composedPath()[0] : e.target;
  if (!target.hasAttribute('data-sifrr-bind') || target._root === null) return;
  const value = target.value || target.textContent;
  if (target.firstChild) target.firstChild.__data = value;
  target.__twoWay = target.__twoWay || new Function('value', `this._root.state.${target.getAttribute('data-sifrr-bind')} = value; this._root.update();`);
  if (!target._root) {
    let root = target.parentNode;
    while(root && !root.isSifrr) root = root.parentNode || root.host;
    if (root) target._root = root;
    else target._root = null;
  }
  if (target._root) target.__twoWay(value);
};
