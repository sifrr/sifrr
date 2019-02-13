// based on https://github.com/Freak613/stage0/blob/master/index.js

const TREE_WALKER = window.document.createTreeWalker(window.document, window.NodeFilter.SHOW_ALL, null, false);

TREE_WALKER.nextNonfilterNode = function(fxn) {
  let node = this.currentNode;
  if (fxn && fxn(node)){
    node = this.nextSibling() || (this.parentNode(), this.nextSibling());
  } else node = this.nextNode();
  return node;
};

TREE_WALKER.roll = function(n, filter) {
  let node = this.currentNode;
  while(--n) {
    node = this.nextNonfilterNode(filter);
  }
  return node;
};

class Ref {
  constructor(idx, ref) {
    this.idx = idx;
    this.ref = ref;
  }
}

function collect(element, stateMap, filter = false) {
  const refs = [];
  TREE_WALKER.currentNode = element;
  stateMap.map(x => refs.push(TREE_WALKER.roll(x.idx, filter)));
  return refs;
}

function create(node, fxn, filter = false) {
  let indices = [], ref, idx = 0;
  TREE_WALKER.currentNode = node;
  while(node) {
    // eslint-disable-next-line no-cond-assign
    if (ref = fxn(node)) {
      indices.push(new Ref(idx+1, ref));
      idx = 1;
    } else {
      idx++;
    }
    node = TREE_WALKER.nextNonfilterNode(filter);
  }

  return indices;
}

module.exports = {
  collect,
  create,
  Ref
};
