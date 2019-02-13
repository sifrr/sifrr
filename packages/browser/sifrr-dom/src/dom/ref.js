// based on https://github.com/Freak613/stage0/blob/master/index.js

const TREE_WALKER = window.document.createTreeWalker(window.document, window.NodeFilter.SHOW_ALL, null, false);

class Ref {
  constructor(idx, ref) {
    this.idx = idx;
    this.ref = ref;
  }
}

function collect(element, stateMap = element.stateMap, filter) {
  const refs = [];
  TREE_WALKER.currentNode = element;
  stateMap.map(x => refs.push(TREE_WALKER.roll(x.idx, filter)));
  return refs;
}

TREE_WALKER.nextNonfilterNode = function(fxn) {
  let node = this.currentNode;
  if (fxn && fxn(node)){
    node = this.nextSibling() || (this.parentNode(), this.nextSibling());
  } else node = this.nextNode();
  return node;
};

TREE_WALKER.roll = function(n, filter = false) {
  let node = this.currentNode;
  while(--n) {
    node = this.nextNonfilterNode(filter);
  }
  return node;
};

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
  walker: TREE_WALKER,
  collect,
  create,
  Ref
};
