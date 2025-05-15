import update from './update';
import { TEXT_NODE, COMMENT_NODE, REFERENCE_COMMENT } from './constants';
import { SifrrCreateFunction, SifrrProps, SifrrNode, SifrrNodesArray } from './types';
import { flatLastElement, flattenOperation, isSifrrNode } from './utils';

const removeFxn = (i?: ChildNode) => i?.remove();

// oldChildren array should be continuous childnodes
export function makeChildrenEqual<T>(
  oldChildren: SifrrNodesArray<T>,
  newChildren: SifrrNodesArray<T> | SifrrProps<T>[],
  createFn?: SifrrCreateFunction<T>,
  parent?: Node & ParentNode
): SifrrNodesArray<T> {
  const lastChild: Node = oldChildren.reference || flatLastElement(oldChildren);
  const nextSib = lastChild ? lastChild.nextSibling : null;
  parent = parent ?? (lastChild.parentNode || undefined);

  console.log(oldChildren, newChildren, lastChild);

  if (!parent) {
    throw Error(
      'Parent should be present for old children given. Open an issue on sifrr if this is a bug.'
    );
  }

  let reference = oldChildren.reference;
  // special case of no value return
  if (newChildren.length < 1 && !reference) {
    reference = REFERENCE_COMMENT();
    parent.insertBefore(reference, lastChild);
  }

  const returnValues = flattenOperation<SifrrNode<T>, SifrrProps<T>>(
    oldChildren,
    newChildren,
    makeEqual,
    removeFxn,
    (i) /* Node */ => parent.insertBefore(i as Node, reference || nextSib),
    (i) => !!createFn && !isSifrrNode(i),
    createFn
  );
  (returnValues as any).reference = reference;

  return returnValues;
}

export function makeEqual<T>(
  oldNode: SifrrNode<T>,
  newNode: SifrrNode<T> | SifrrProps<T>
): SifrrNode<T> {
  if (oldNode === newNode) return oldNode;

  if (!newNode.nodeType) {
    update(oldNode, <SifrrProps<T>>newNode);
    return oldNode;
  }

  // Text or comment node
  if (
    (oldNode.nodeType === TEXT_NODE && newNode.nodeType === TEXT_NODE) ||
    (oldNode.nodeType === COMMENT_NODE && newNode.nodeType === COMMENT_NODE)
  ) {
    if ((<Text>(<unknown>oldNode)).data !== (<Text>(<unknown>newNode)).data)
      (<Text>(<unknown>oldNode)).data = (<Text>(<unknown>newNode)).data;
    return oldNode;
  }

  (<ChildNode>oldNode).replaceWith(<SifrrNode<T>>newNode);
  return <SifrrNode<T>>newNode;
}
