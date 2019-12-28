import updateAttribute from './updateattribute';
import update from './update';
import { TEXT_NODE, COMMENT_NODE } from './constants';
import { SifrrCloneFunction, TemplateProps } from './types';
import { arrayOf } from '../utils';

// oldChildren array should be continuous childnodes
export function makeChildrenEqual(
  oldChildren: ChildNode[],
  newChildren: Node[] | TemplateProps[],
  createFn?: SifrrCloneFunction
) {
  const newL = newChildren.length;
  const oldL = oldChildren.length;
  const nextSib = oldChildren[oldL - 1].nextSibling;
  const parent = oldChildren[oldL - 1].parentNode;

  // Lesser children now
  if (oldL > newL) {
    let i = oldL - 1;
    while (i > newL - 1) {
      oldChildren[i].remove();
      i--;
    }
  }

  let item: Node | TemplateProps,
    head = oldChildren[0];

  let i = 0;
  // Make old children equal to new children
  while (i < oldL && i < newL) {
    item = makeEqual(head, newChildren[i]);
    newChildren[i] = item;
    head = item.nextSibling;
    i++;
  }
  // Add extra new children
  while (i < newL) {
    item = newChildren[i];
    const toAppend = <Node>(
      (item instanceof Node ? <ChildNode>item : createFn(<TemplateProps>item).content)
    );
    parent.insertBefore(toAppend, nextSib);
    i++;
  }
}

export function makeEqual(oldNode: ChildNode, newNode: Node | TemplateProps): ChildNode {
  if (!(newNode instanceof Node)) {
    oldNode.__sifrrTemplate.props = newNode;
    update(oldNode.__sifrrTemplate);
    return oldNode;
  }

  if (oldNode.nodeName !== newNode.nodeName) {
    oldNode.replaceWith(newNode);
    return <ChildNode>newNode;
  }

  // Text or comment node
  if (oldNode.nodeType === TEXT_NODE || oldNode.nodeType === COMMENT_NODE) {
    if ((<Text>(<unknown>oldNode)).data !== (<Text>(<unknown>newNode)).data)
      (<Text>(<unknown>oldNode)).data = (<Text>(<unknown>newNode)).data;
    return oldNode;
  }

  if (!(oldNode instanceof HTMLElement) || !(newNode instanceof HTMLElement)) return;

  // copy Attributes
  const oldAttrs = oldNode.attributes,
    newAttrs = newNode.attributes;
  for (let i = newAttrs.length - 1; i > -1; --i) {
    updateAttribute(oldNode, newAttrs[i].name, newAttrs[i].value);
  }

  // Remove any extra attributes
  for (let j = oldAttrs.length - 1; j > -1; --j) {
    if (!newNode.hasAttribute(oldAttrs[j].name)) oldNode.removeAttribute(oldAttrs[j].name);
  }

  // make children equal
  makeChildrenEqual(arrayOf(oldNode.childNodes), arrayOf<ChildNode>(newNode.childNodes));

  return oldNode;
}
