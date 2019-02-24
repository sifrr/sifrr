const updateAttribute = require('./updateattribute');
const { shallowEqual } = require('../utils/json');
const { TEXT_NODE, COMMENT_NODE } = require('./constants');

function makeChildrenEqual(parent, newChildren, createFn) {
  const oldL = parent.childNodes.length, newL = newChildren.length;
  // Fast path for clear
  if (newL === 0) {
    parent.textContent = '';
    return;
  }

  // More Children now
  if (oldL < newL) {
    let i = oldL, addition;
    while(i < newL) {
      addition = newChildren[i];
      if (!newChildren[i].nodeType) addition = createFn(newChildren[i]);
      parent.appendChild(addition);
      i++;
    }
  // Lesser children now
  } else if (oldL > newL) {
    let i = oldL;
    while(i > newL) {
      parent.removeChild(parent.lastChild);
      i--;
    }
  }

  // Fast path for create
  if (oldL === 0) return;

  const l = Math.min(newL, oldL);
  // Make old children equal to new children
  for(let i = 0, item, head = parent.firstChild; i < l; i++) {
    item = newChildren[i];
    // make two nodes equal
    head = makeEqual(head, item).nextSibling;
  }
}

function makeEqual(oldNode, newNode) {
  if (!newNode.nodeType) {
    if (!shallowEqual(oldNode.state, newNode)) {
      oldNode.state = newNode;
    }
    return oldNode;
  }

  if (oldNode.nodeName !== newNode.nodeName) {
    oldNode.replaceWith(newNode);
    return newNode;
  }

  // Text or comment node
  if (oldNode.nodeType === TEXT_NODE || oldNode.nodeType === COMMENT_NODE) {
    if (oldNode.data !== newNode.data) oldNode.data = newNode.data;
    return oldNode;
  }

  // copy sifrr state
  if (newNode.state) oldNode.state = newNode.state;

  // copy Attributes
  const oldAttrs = oldNode.attributes, newAttrs = newNode.attributes;
  for (let i = newAttrs.length - 1; i >= 0; --i) {
    updateAttribute(oldNode, newAttrs[i].name, newAttrs[i].value);
  }

  // Remove any extra attributes
  for (let j = oldAttrs.length - 1; j >= 0; --j) {
    if (!newNode.hasAttribute(oldAttrs[j].name)) oldNode.removeAttribute(oldAttrs[j].name);
  }

  // make children equal
  makeChildrenEqual(oldNode, Array.prototype.slice.call(newNode.childNodes));

  return oldNode;
}

module.exports = {
  makeEqual,
  makeChildrenEqual
};
