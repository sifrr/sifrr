// based on https://github.com/Freak613/stage0/blob/master/index.js

const TREE_WALKER = window.document.createTreeWalker(window.document, window.NodeFilter.SHOW_ALL, null, false);
TREE_WALKER.roll = function(n, filter = false) {
  let node = this.currentNode;
  while(--n) {
    if (filter && filter(node)){
      node = TREE_WALKER.nextSibling() || TREE_WALKER.parentNode();
    } else node = TREE_WALKER.nextNode();
  }
  return node;
};

function collect(element, stateMap = element.stateMap, filter) {
  const refs = [];
  TREE_WALKER.currentNode = element;
  stateMap.map(x => refs.push(TREE_WALKER.roll(x.idx, filter)));
  return refs;
}

class Ref {
  constructor(idx, ref) {
    this.idx = idx;
    this.ref = ref;
  }
}

function create(node, fxn, filter = false) {
  let indices = [], ref, idx = 0;
  TREE_WALKER.currentNode = node;
  while(node) {
    if (ref = fxn(node)) {
      indices.push(new Ref(idx+1, ref));
      idx = 1;
    } else {
      idx++;
    }
    if (filter && filter(node)){
      node = TREE_WALKER.nextSibling() || TREE_WALKER.parentNode();
    } else node = TREE_WALKER.nextNode();
  }

  return indices;
}

module.exports = {
  walker: TREE_WALKER,
  collect,
  create,
  Ref
};
