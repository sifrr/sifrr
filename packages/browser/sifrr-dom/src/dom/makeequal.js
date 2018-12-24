const { updateAttribute } = require('./update');

// Inspired from https://github.com/Freak613/stage0/blob/master/reuseNodes.js
function makeChildrenEqual(parent, newChildren) {
  if (!Array.isArray(newChildren)) newChildren = Array.prototype.slice.call(newChildren);
  if (newChildren.length === 0) {
    parent.textContent = '';
    return;
  }
  // Lesser children now
  let l = parent.childNodes.length;
  if (l > newChildren.length) {
    let i = l;
    while(i > newChildren.length) {
      parent.removeChild(parent.lastChild);
      i--;
    }
  }

  // More children now
  let head = parent.firstChild;
  for(let i = 0, item; i < newChildren.length; i++) {
    item = newChildren[i];
    if (!head && item) {
      parent.appendChild(item);
    } else {
      // make two nodes equal
      head = makeEqual(head, item).nextSibling;
    }
  }
}

function makeEqual(oldNode, newNode) {
  if (newNode === null) return oldNode;
  if (newNode.type === 'stateChange') {
    if (oldNode.state !== newNode.state) oldNode.state = newNode.state;
    return oldNode;
  }

  if (oldNode.nodeName !== newNode.nodeName) {
    oldNode.replaceWith(newNode);
    return newNode;
  }

  if (oldNode.nodeType === window.Node.TEXT_NODE || oldNode.nodeType === window.Node.COMMENT_NODE) {
    if (oldNode.data !== newNode.data) oldNode.data = newNode.data;
    return oldNode;
  }

  // copy sifrr state
  oldNode.state = newNode.state;

  // copy Attributes
  let oldAttrs = oldNode.attributes, newAttrs = newNode.attributes, attr;
  for (var i = newAttrs.length - 1; i >= 0; --i) {
    updateAttribute(oldNode, newAttrs[i].name, newAttrs[i].value);
  }

  // Remove any extra attributes
  for (var j = oldAttrs.length - 1; j >= 0; --j) {
    attr = oldAttrs[j];
    if (!newNode.hasAttribute(attr.name) && attr.specified !== false) oldNode.removeAttribute(attr.name);
  }

  // make children equal
  makeChildrenEqual(oldNode, newNode.childNodes);

  return oldNode;
}

module.exports = {
  makeEqual: makeEqual,
  makeChildrenEqual: makeChildrenEqual
};
