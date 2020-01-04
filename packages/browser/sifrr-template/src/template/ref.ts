// based on https://github.com/Freak613/stage0/blob/master/index.js
import { TEXT_NODE, TREE_WALKER } from './constants';
import {
  SifrrRef,
  SifrrBindCreatorFxn,
  SifrrBindMap,
  SifrrRefCollection,
  SifrrBindType
} from './types';
const TW_SHARED = TREE_WALKER(document);

function collectValues<T>(element: Node, bindMap: SifrrBindMap<T>[]): any[] {
  const oldValues = new Array(bindMap.length);
  for (let j = bindMap.length - 1; j > -1; --j) {
    const binding = bindMap[j];

    if (binding.type === SifrrBindType.Text) {
      oldValues[j] = [element];
    } else if (binding.type === SifrrBindType.Attribute) {
      oldValues[j] = null;
    } else if (binding.type === SifrrBindType.Prop) {
      if (binding.name === 'style') {
        oldValues[j] = {};
      } else {
        oldValues[j] = null;
      }
    }
  }
  return oldValues;
}

function getNPromises(n: number): Promise<any>[] {
  const promises = [];
  for (let i = 0; i < n; i++) {
    promises.push(Promise.resolve(true));
  }
  return promises;
}

export function collect<T>(
  element: Node | DocumentFragment,
  refMap: SifrrRef<T>[]
): SifrrRefCollection<T>[] {
  const l = refMap.length,
    refs: SifrrRefCollection<T>[] = new Array(l);
  TW_SHARED.currentNode = element;
  for (let i = 0, n: number; i < l; i++) {
    n = refMap[i].idx;
    while (--n) element = TW_SHARED.nextNode();
    refs[i] = {
      node: <Node>element,
      currentValues: collectValues(<Node>element, refMap[i].map),
      oldPromises: getNPromises(l),
      bindMap: refMap[i].map
    };
  }
  return refs;
}

export function create<T>(
  mainNode: Node,
  fxn: SifrrBindCreatorFxn<T>,
  passedValue: any
): SifrrRef<T>[] {
  const TW = TREE_WALKER(mainNode);
  const indices: SifrrRef<T>[] = [];
  let map: SifrrBindMap<T>[] | 0,
    idx = 0,
    ntr: ChildNode,
    node = mainNode;
  // TW.currentNode = node;
  while (node) {
    if (
      node !== mainNode &&
      node.nodeType === TEXT_NODE &&
      (<Text>(<unknown>node)).data.trim() === ''
    ) {
      ntr = <ChildNode>node;
      node = TW.nextNode();
      ntr.remove && ntr.remove();
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

export function cleanEmptyNodes(node: DocumentFragment | ChildNode) {
  const TW = TREE_WALKER(node);
  let ntr: ChildNode;
  while (node) {
    if (node.nodeType === TEXT_NODE && (<Text>(<unknown>node)).data.trim() === '') {
      ntr = <ChildNode>node;
      node = <ChildNode>TW.nextNode();
      ntr.remove && ntr.remove();
    } else {
      node = <HTMLElement>TW.nextNode();
    }
  }
}
