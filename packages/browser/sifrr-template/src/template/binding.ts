// based on https://github.com/Freak613/stage0/blob/master/index.js
import { TEXT_NODE, TREE_WALKER } from './constants';
import {
  SifrrBinding,
  SifrrBindCreatorFxn,
  SifrrBindMap,
  SifrrBindingCollection,
  SifrrBindType
} from './types';
const TW_SHARED = TREE_WALKER(document);

function collectValues<T>(element: Node, bindMap: SifrrBindMap<T>[]): any[] {
  const oldValues = new Array(bindMap.length);
  for (let j = bindMap.length - 1; j > -1; --j) {
    const binding = bindMap[j]!;

    if (binding.type === SifrrBindType.Text) {
      oldValues[j] = [element];
    } else if (binding.type === SifrrBindType.Attribute) {
      oldValues[j] = null;
    } else if (binding.type === SifrrBindType.Prop || binding.type === SifrrBindType.DirectProp) {
      if (binding.name === 'style') {
        oldValues[j] = Object.create(null);
      } else {
        oldValues[j] = null;
      }
    } else if (binding.type === SifrrBindType.If) {
      oldValues[j] = element;
    }
  }
  return oldValues;
}

export function collect<T>(
  element: Node | DocumentFragment,
  refMap: SifrrBinding<T>[]
): SifrrBindingCollection<T>[] {
  const l = refMap.length,
    refs: SifrrBindingCollection<T>[] = new Array(l);
  TW_SHARED.currentNode = element;
  for (let i = 0, n: number; i < l; i++) {
    n = refMap[i]!.idx;
    while (--n) {
      TW_SHARED.nextNode();
    }
    refs[i] = {
      node: TW_SHARED.currentNode as HTMLElement & {
        [x: string]: unknown;
      },
      currentValues: collectValues(TW_SHARED.currentNode, refMap[i]!.map),
      bindMap: refMap[i]!.map
    };
  }
  return refs;
}

export function createBindings<T>(
  mainNode: Node,
  fxn: SifrrBindCreatorFxn<T>,
  passedValue: any
): SifrrBinding<T>[] {
  const TW = TREE_WALKER(mainNode);
  const indices: SifrrBinding<T>[] = [];
  let map: SifrrBindMap<T>[] | 0,
    idx = 0,
    node: Node | null = mainNode;
  while (node) {
    if ((map = fxn(node, passedValue))) {
      indices.push({ idx: idx + 1, map });
      idx = 1;
    } else {
      idx++;
    }
    node = TW.nextNode() ?? TW.nextSibling();
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
