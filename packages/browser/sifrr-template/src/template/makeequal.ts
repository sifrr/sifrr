import update from './update';
import { TEXT_NODE, COMMENT_NODE } from './constants';
import { SifrrCreateFunction, SifrrProps, SifrrNodes } from './types';
import { isSifrrNode } from './utils';

function insertBefore(nodes: SifrrNodes<any>, parent: Node, child: ChildNode) {
  for (let i = 0; i < nodes.length; i++) {
    const nt = nodes[i];
    if (Array.isArray(nt)) {
      insertBefore(nt, parent, child);
    } else {
      parent.insertBefore(nt, child);
    }
  }
}

// oldChildren array should be continuous childnodes
export function makeChildrenEqual<T>(
  oldChildren: ChildNode[],
  newChildren: Node[] | SifrrProps<T>[],
  createFn?: SifrrCreateFunction<T>,
  parent?: Node & ParentNode
): Node[] {
  const newL = newChildren.length;
  const oldL = oldChildren.length;
  const nextSib = oldChildren[oldL - 1] && oldChildren[oldL - 1].nextSibling;
  parent = parent || oldChildren[oldL - 1].parentNode;

  const returnNodes = [];

  // Lesser children now
  if (oldL > newL) {
    let i = oldL - 1;
    while (i > newL - 1) {
      oldChildren[i].remove();
      i--;
    }
  }

  let item: Node | SifrrProps<T>,
    head = oldChildren[0];

  let i = 0;
  // Make old children equal to new children
  while (i < oldL && i < newL) {
    item = makeEqual(head, newChildren[i]);
    returnNodes.push(item);
    head = item.nextSibling;
    i++;
  }
  // Add extra new children
  while (i < newL) {
    item = newChildren[i];
    if (item instanceof Node) {
      parent.insertBefore(item, nextSib);
      returnNodes.push(item);
    } else {
      const nti = createFn(<SifrrProps<T>>item, null);
      insertBefore(nti, parent, nextSib);
      returnNodes.push(nti);
    }
    i++;
  }

  return returnNodes;
}

export function makeEqual<T>(oldNode: ChildNode, newNode: Node | SifrrProps<T>): ChildNode {
  if (!(newNode instanceof Node)) {
    if (isSifrrNode(oldNode)) update(oldNode, newNode);
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

  if (!(oldNode instanceof Node) || !(newNode instanceof Node)) return oldNode;

  oldNode.replaceWith(newNode);
  return <ChildNode>newNode;
}
