import { DomBindingReturnValue, SifrrNodesArray, SifrrNode } from './types';

const emptyArray: SifrrNodesArray<any> = [];

export default function getNodesFromBindingValue<T>(
  value: DomBindingReturnValue | SifrrNodesArray<T> | SifrrNode<T>
): SifrrNodesArray<T> {
  if (value === null || value === undefined) {
    return emptyArray;
  } else if (typeof value === 'string') {
    return [document.createTextNode(value)];
  } else if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      value[i] = getNodesFromBindingValue<T>(value[i]);
    }
    return value as SifrrNodesArray<T>;
  } else if (value instanceof HTMLTemplateElement) {
    return Array.prototype.slice.call(value.content.childNodes);
  } else if (value instanceof Node) {
    return [value as SifrrNode<T>];
  } else if (value instanceof NodeList) {
    return Array.prototype.slice.call(value);
  } else {
    return [document.createTextNode((value as any).toString())];
  }
}
