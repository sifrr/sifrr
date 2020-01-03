import { DomBindingReturnValue, SifrrNodesArray, SifrrNode } from './types';
import { arrayOf } from './utils';

const emptyArray = [];

export default function getNodesFromBindingValue<T, X>(
  value: DomBindingReturnValue | X,
  retObject: boolean = false
): SifrrNodesArray<T> | SifrrNode<T> | X {
  if (value === null || value === undefined) {
    return emptyArray;
  } else if (typeof value === 'string') {
    return document.createTextNode(value);
  } else if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      value[i] = <SifrrNodesArray<T> | SifrrNode<T>>getNodesFromBindingValue<T, X>(value[i]);
    }
    return <SifrrNodesArray<T>>value;
  } else if (value instanceof HTMLTemplateElement) {
    return arrayOf(value.content.childNodes);
  } else if (value instanceof Node) {
    return <SifrrNode<T>>value;
  } else if (value instanceof NodeList) {
    return arrayOf(value);
  } else if (retObject) {
    return <X>value;
  } else {
    return document.createTextNode(value.toString());
  }
}
