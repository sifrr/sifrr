// based on https://github.com/Freak613/stage0/blob/master/index.js

const { TEXT_NODE, TREE_WALKER } = require('./constants');
const TW_SHARED = TREE_WALKER();

function collect(element, stateMap) {
  const l = stateMap.length, refs = new Array(l);
  TW_SHARED.currentNode = element;
  for (let i = 0, n; i < l; i++) {
    n = stateMap[i].idx;
    while(--n) {
      element = TW_SHARED.nextNode();
    }
    refs[i] = element;
  }
  return refs;
}

function create(node, fxn, passedArg) {
  const TW = TREE_WALKER();
  let indices = [], ref, idx = 0, ntr;
  TW.currentNode = node;
  while(node) {
    if (node.nodeType === TEXT_NODE && node.data.trim() === '') {
      ntr = node;
      node = TW.nextNode(node);
      ntr.remove();
    } else {
      // eslint-disable-next-line no-cond-assign
      if (ref = fxn(node, passedArg)) {
        indices.push({ idx: idx+1, ref });
        idx = 1;
      } else {
        idx++;
      }
      node = TW.nextNode(node);
    }
  }
  return indices;
}

module.exports = {
  collect,
  create
};
