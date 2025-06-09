import { update } from './update';
import { TEXT_NODE, COMMENT_NODE, REFERENCE_COMMENT } from './constants';
import { SifrrCreateFunction, SifrrProps, SifrrNode, SifrrNodesArray } from './types';
import { flatLastElement, flattenOperation, isSifrrNode } from './utils';

const removeFxn = (i?: ChildNode) => i?.remove();

// oldChildren array should be continuous childnodes
export function makeChildrenEqual<T>(
  oldChildren: ChildNode[],
  newChildren: (Node | SifrrProps<T>)[],
  createFn?: SifrrCreateFunction<T>,
  parent?: Node & ParentNode
): SifrrNodesArray<T> {
  const lastChild: Node = flatLastElement(oldChildren);
  const nextSib = lastChild ? lastChild.nextSibling : null;
  parent = lastChild.parentNode ?? parent;

  if (!parent) {
    console.error(oldChildren);
    throw Error(
      '^ Parent should be present for old children given. Open an issue on sifrr if this is a bug.'
    );
  }

  // special case of no value return
  if (newChildren.length < 1) {
    if (oldChildren.length !== 1 || oldChildren[0]?.nodeType !== COMMENT_NODE)
      newChildren.push(REFERENCE_COMMENT());
    else newChildren = oldChildren;
  } else if (oldChildren.length === 1 && oldChildren[0]?.nodeType === COMMENT_NODE) {
    oldChildren[0]?.remove();
    oldChildren = [];
  }

  const returnValues = flattenOperation<T>(
    oldChildren,
    newChildren,
    makeEqual,
    removeFxn,
    (i) => parent.insertBefore(i as SifrrNode<T>, nextSib),
    (i) => !!createFn && i instanceof Node,
    createFn
  );

  return returnValues;
}

export function makeEqual<T>(
  oldNode: SifrrNode<T>,
  newNode: SifrrNode<T> | SifrrProps<T>
): SifrrNode<T> {
  if (oldNode === newNode) return oldNode;

  if (!(newNode instanceof Node)) {
    update(oldNode, newNode);
    return oldNode;
  }

  // Text or comment node
  if (
    (oldNode.nodeType === TEXT_NODE && newNode.nodeType === TEXT_NODE) ||
    (oldNode.nodeType === COMMENT_NODE && newNode.nodeType === COMMENT_NODE)
  ) {
    if ((<Text>oldNode).data !== (<Text>newNode).data) (<Text>oldNode).data = (<Text>newNode).data;
    return oldNode;
  }

  oldNode.replaceWith(newNode);
  return newNode;
}
