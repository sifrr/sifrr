// based on https://github.com/Freak613/stage0/blob/master/index.js
import { TEXT_NODE, TREE_WALKER } from './constants';
import {
  SifrrRef,
  SifrrBindCreatorFxn,
  SifrrBindMap,
  SifrrRefCollection,
  DomBindingReturnValue,
  SifrrBindType
} from './types';
const TW_SHARED = TREE_WALKER();

function collectValues(element: Node, bindMap: SifrrBindMap[]): DomBindingReturnValue[] {
  const oldValues: DomBindingReturnValue[] = new Array(bindMap.length);
  for (let j = bindMap.length - 1; j > -1; --j) {
    const binding = bindMap[j];

    if (binding.type === SifrrBindType.Text) {
      oldValues[j] = element;
    } else if (binding.type === SifrrBindType.Attribute) {
      oldValues[j] = (<HTMLElement>element).getAttribute(binding.name);
    } else if (binding.type === SifrrBindType.Prop) {
      oldValues[j] = (<HTMLElement>element)[binding.name];
    }
  }
  return oldValues;
}

export function collect(
  element: Node | DocumentFragment,
  refMap: SifrrRef[]
): SifrrRefCollection[] {
  const l = refMap.length,
    refs: SifrrRefCollection[] = new Array(l);
  TW_SHARED.currentNode = element;
  for (let i = 0, n: number; i < l; i++) {
    n = refMap[i].idx;
    while (--n) element = TW_SHARED.nextNode();
    refs[i] = {
      node: <Node>element,
      currentValues: collectValues(<Node>element, refMap[i].map),
      bindMap: refMap[i].map
    };
  }
  return refs;
}

export function create(
  node: HTMLElement | DocumentFragment,
  fxn: SifrrBindCreatorFxn,
  passedValue: any
): SifrrRef[] {
  const TW = TREE_WALKER();
  const indices: SifrrRef[] = [];
  let map: SifrrBindMap[] | 0,
    idx = 0,
    ntr: HTMLElement;
  TW.currentNode = node;
  while (node) {
    if (node.nodeType === TEXT_NODE && (<Text>(<unknown>node)).data.trim() === '') {
      ntr = <HTMLElement>node;
      node = <HTMLElement>TW.nextNode();
      ntr.remove();
    } else {
      if ((map = fxn(<HTMLElement>node, passedValue))) {
        indices.push({ idx: idx + 1, map });
        idx = 1;
      } else {
        idx++;
      }
      node = <HTMLElement>TW.nextNode();
    }
  }
  return indices;
}
