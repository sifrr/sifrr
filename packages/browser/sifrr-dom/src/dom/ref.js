// based on https://github.com/Freak613/stage0/blob/master/index.js

const TREE_WALKER = window.document.createTreeWalker(window.document, window.NodeFilter.SHOW_ALL, null, false);
const { HTML_ATTR, TEXT_NODE } = require('./constants');

function isHtml(el) {
  return el.hasAttribute && el.hasAttribute(HTML_ATTR);
}

TREE_WALKER.nextFilteredNode = function() {
  let node = this.currentNode;
  if (isHtml(node)){
    node = this.nextSibling() || (this.parentNode(), this.nextSibling());
  } else node = this.nextNode();
  return node;
};

function collect(node, stateMap, next = 'nextFilteredNode') {
  const l = stateMap.length, refs = new Array(l);
  TREE_WALKER.currentNode = node;
  for (let i = 0, n; i < l; i++) {
    n = stateMap[i].idx;
    while(--n) TREE_WALKER[next]();
    refs[i] = TREE_WALKER.currentNode;
  }
  return refs;
}

function create(node, fxn, passedArg) {
  let indices = [], ref, idx = 0, ntr;
  TREE_WALKER.currentNode = node;
  while(node) {
    if (node.nodeType === TEXT_NODE && node.data.trim() === '') {
      ntr = node;
      node = TREE_WALKER.nextFilteredNode(node);
      ntr.remove();
    } else {
      // eslint-disable-next-line no-cond-assign
      if (ref = fxn(node, isHtml, passedArg)) {
        indices.push({ idx: idx+1, ref });
        idx = 1;
      } else {
        idx++;
      }
      node = TREE_WALKER.nextFilteredNode(node);
    }
  }
  return indices;
}

module.exports = {
  collect,
  create
};
