import { DomBindingReturnValue, SifrrNodesArray, SifrrNode } from './types';

const emptyArray: SifrrNode<any>[] = [];

export default function getNodesFromBindingValue<T>(
  value: DomBindingReturnValue | SifrrNodesArray<T> | SifrrNode<T>
): SifrrNode<T>[] {
  if (value === null || value === undefined) {
    return [];
  } else if (typeof value === 'string') {
    return [document.createTextNode(value)];
  } else if (value instanceof SifrrNodesArray) {
    return value;
  } else if (Array.isArray(value)) {
    const newValue = [];
    for (const element of value) {
      newValue.push(...getNodesFromBindingValue<T>(element));
    }
    return newValue as SifrrNode<T>[];
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
