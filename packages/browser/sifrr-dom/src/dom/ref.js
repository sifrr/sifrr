// based on https://github.com/Freak613/stage0/blob/master/index.js

const TREE_WALKER = window.document.createTreeWalker(window.document, window.NodeFilter.SHOW_ALL, null, false);
const { TEXT_NODE } = require('./constants');

function collect(element, stateMap) {
  const l = stateMap.length, refs = new Array(l);
  let node = TREE_WALKER.currentNode = element, n;
  for (let i = 0; i < l; i++) {
    n = stateMap[i].idx;
    while(--n) {
      node = TREE_WALKER.nextNode();
    }
    refs[i] = node;
  }
  return refs;
}

function create(node, fxn, passedArg) {
  let indices = [], ref, idx = 0, ntr;
  TREE_WALKER.currentNode = node;
  while(node) {
    if (node.nodeType === TEXT_NODE && node.data.trim() === '') {
      ntr = node;
      node = TREE_WALKER.nextNode(node);
      ntr.remove();
    } else {
      // eslint-disable-next-line no-cond-assign
      if (ref = fxn(node, passedArg)) {
        indices.push({ idx: idx+1, ref });
        idx = 1;
      } else {
        idx++;
      }
      node = TREE_WALKER.nextNode(node);
    }
  }
  return indices;
}

module.exports = {
  collect,
  create
};
