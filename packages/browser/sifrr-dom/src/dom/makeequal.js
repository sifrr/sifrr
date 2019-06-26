const updateAttribute = require('./updateattribute');
const shouldMerge = require('../utils/shouldmerge');
const { TEXT_NODE, COMMENT_NODE } = require('./constants');

function makeChildrenEqual(parent, newChildren, createFn, isNode = false) {
  const newL = newChildren.length,
    oldL = parent.childNodes.length;
  // Lesser children now
  if (oldL > newL) {
    let i = oldL;
    while (i > newL) {
      parent.removeChild(parent.lastChild);
      i--;
    }
  }

  let item,
    head = parent.firstChild,
    curNewChild = newChildren[0];
  if (isNode) {
    // Make old children equal to new children
    while (head) {
      item = curNewChild.nextSibling;
      head = makeEqual(head, curNewChild).nextSibling;
      curNewChild = item;
    }
    // Add extra new children
    while (curNewChild) {
      item = curNewChild.nextSibling;
      parent.appendChild(curNewChild);
      curNewChild = item;
    }
  } else {
    let i = 0;
    // Make old children equal to new children
    while (head) {
      head = makeEqual(head, newChildren[i]).nextSibling;
      i++;
    }
    // Add extra new children
    while (i < newL) {
      item = newChildren[i];
      parent.appendChild(item.nodeType ? item : createFn(item));
      i++;
    }
  }
}

function makeEqual(oldNode, newNode) {
  if (!newNode.nodeType) {
    if (shouldMerge(oldNode._state, newNode)) oldNode.state = newNode;
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
  const oldAttrs = oldNode.attributes,
    newAttrs = newNode.attributes;
  for (let i = newAttrs.length - 1; i > -1; --i) {
    updateAttribute(oldNode, newAttrs[i].name, newAttrs[i].value);
  }

  // Remove any extra attributes
  for (let j = oldAttrs.length - 1; j > -1; --j) {
    if (!newNode.hasAttribute(oldAttrs[j].name)) oldNode.removeAttribute(oldAttrs[j].name);
  }

  // make children equal
  makeChildrenEqual(oldNode, newNode.childNodes, undefined, true);

  return oldNode;
}

module.exports = {
  makeEqual,
  makeChildrenEqual
};
