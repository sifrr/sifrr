function makeChildrenEqual(parent, newChildren) {
  if (!Array.isArray(newChildren)) newChildren = Array.prototype.slice.call(newChildren);
  if (newChildren.length === 0) {
    parent.textContent = '';
    return;
  }
  // Lesser children now
  let l = parent.childNodes.length;
  if (l > newChildren.length) {
    let i = l, tail = parent.lastChild, tmp;
    while(i > newChildren.length) {
      tmp = tail.previousSibling;
      parent.removeChild(tail);
      tail = tmp;
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

// taken from https://github.com/choojs/nanomorph/blob/master/lib/morph.js
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
    if (oldNode.nodeValue !== newNode.nodeValue) {
      oldNode.nodeValue = newNode.nodeValue;
    }
    return oldNode;
  }

  // copy sifrr state
  oldNode.state = newNode.state;

  // copy Attributes
  let oldAttrs = oldNode.attributes, newAttrs = newNode.attributes, attrValue, fromValue, attrName, attr;
  for (var i = newAttrs.length - 1; i >= 0; --i) {
    attr = newAttrs[i];
    attrName = attr.name;
    attrValue = attr.value;
    if (!oldNode.hasAttribute(attrName)) {
      oldNode.setAttribute(attrName, attrValue);
    } else {
      fromValue = oldNode.getAttribute(attrName);
      if (fromValue !== attrValue) {
        // apparently values are always cast to strings, ah well
        if (attrValue === 'null' || attrValue === 'undefined' || attrValue === 'false' || !attrValue) {
          oldNode.removeAttribute(attrName);
        } else {
          oldNode.setAttribute(attrName, attrValue);
        }
      }
    }
  }

  // Remove any extra attributes
  for (var j = oldAttrs.length - 1; j >= 0; --j) {
    attr = oldAttrs[j];
    if (attr.specified !== false) {
      attrName = attr.name;
      if (!newNode.hasAttribute(attrName)) {
        oldNode.removeAttribute(attrName);
      }
    }
  }

  // make children equal
  makeChildrenEqual(oldNode, newNode.childNodes);

  return oldNode;
}

module.exports = {
  makeEqual: makeEqual,
  makeChildrenEqual: makeChildrenEqual
};
