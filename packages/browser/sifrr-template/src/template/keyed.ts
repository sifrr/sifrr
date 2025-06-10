/* eslint-disable */
import { COMMENT_NODE, REFERENCE_COMMENT } from '@/template/constants';
import { makeEqual } from './makeequal';
import {
  ChildNodeKeyed,
  SifrrCreateFunction,
  SifrrNode,
  SifrrKeyedProps,
  SifrrNodesArrayKeyed,
  SifrrKeyType,
  SifrrNodeKeyed
} from './types';
import { flatLastElement } from './utils';

const isComment = (c?: Node | any): c is Comment => {
  return c?.nodeType === COMMENT_NODE;
};

// Inspired from https://github.com/Freak613/stage0/blob/master/reconcile.js
// This is almost straightforward implementation of reconcillation algorithm
// based on ivi documentation:
// https://github.com/localvoid/ivi/blob/2c81ead934b9128e092cc2a5ef2d3cabc73cb5dd/packages/ivi/src/vdom/implementation.ts#L1366
// With some fast paths from Surplus implementation:
// https://github.com/adamhaile/surplus/blob/master/src/runtime/content.ts#L86
//
// How this implementation differs from others, is that it's working with data directly,
// without maintaining nodes arrays, and manipulates dom only when required

// only works with data nodes
export function makeChildrenEqualKeyed<T>(
  oldChildren: SifrrNodesArrayKeyed<T>,
  newData: (SifrrKeyedProps<T> | (Comment & { key: SifrrKeyType }))[],
  createFn: SifrrCreateFunction<T & { key: SifrrKeyType }>
): SifrrNodesArrayKeyed<T> {
  // special case of no value return
  if (newData.length < 1) {
    if (oldChildren.length !== 1 || oldChildren[0]?.nodeType !== COMMENT_NODE)
      newData.push(REFERENCE_COMMENT(true));
    else newData = oldChildren as (Comment & { key: SifrrKeyType })[];
  }

  const newL = newData.length,
    oldL = oldChildren.length;

  const lastChild: Node = oldChildren && flatLastElement(oldChildren);
  const nextSib = lastChild.nextSibling;
  const parent = lastChild.parentNode;
  const returnNodes: SifrrNodesArrayKeyed<T> = new Array(newL);

  if (!parent) {
    throw Error(
      'Parent should be given of there were no Child Nodes Before. Open an issue on sifrr/sifrr if you think this is a bug.'
    );
  }

  if (oldL === 0) {
    for (let i = 0; i < newL; i++) {
      const d = newData[i]!;
      const n = isComment(d) ? d : createFn(d)[0]!;
      n.key = newData[i]!.key;
      returnNodes[i] = n! as SifrrNodeKeyed<T>;
      parent.insertBefore(n, nextSib);
    }
    return returnNodes;
  }

  // reconciliation
  let prevStart = 0,
    newStart = 0,
    loop = true,
    prevEnd = oldL - 1,
    newEnd = newL - 1,
    prevStartNode = oldChildren[0]!,
    prevEndNode = oldChildren[oldL - 1]!,
    finalNode,
    a: any,
    b: any,
    _node: SifrrNodeKeyed<T>;

  fixes: while (loop) {
    loop = false;

    // Skip prefix
    a = prevStartNode;
    b = newData[newStart];
    while (b && a.key === b.key) {
      returnNodes[newStart] = makeEqual(prevStartNode, b) as SifrrNodeKeyed<T>;
      prevStart++;
      prevStartNode = (prevStartNode?.nextSibling ?? undefined) as SifrrNodeKeyed<T>;
      newStart++;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = prevStartNode;
      b = newData[newStart];
    }

    // Skip suffix
    a = prevEndNode;
    b = newData[newEnd];
    while (b && a.key === b.key) {
      returnNodes[newEnd] = makeEqual(prevEndNode, b) as SifrrNodeKeyed<T>;
      prevEnd--;
      finalNode = prevEndNode;
      prevEndNode = prevEndNode.previousSibling as SifrrNodeKeyed<T>;
      newEnd--;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = prevEndNode;
      b = newData[newEnd];
    }

    // Fast path to swap backward
    a = prevEndNode;
    b = newData[newStart];
    while (b && a.key === b.key) {
      loop = true;
      returnNodes[newStart] = makeEqual(prevEndNode, b) as SifrrNodeKeyed<T>;
      _node = prevEndNode.previousSibling as SifrrNodeKeyed<T>;
      parent.insertBefore(prevEndNode, prevStartNode);
      prevEndNode = _node;
      prevEnd--;
      newStart++;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = prevEndNode;
      b = newData[newStart];
    }

    // Fast path to swap forward
    a = prevStartNode;
    b = newData[newEnd];
    while (b && a.key === b.key) {
      loop = true;
      returnNodes[newEnd] = makeEqual(prevStartNode, b) as SifrrNodeKeyed<T>;
      _node = prevStartNode.nextSibling as SifrrNodeKeyed<T>;
      parent.insertBefore(prevStartNode, prevEndNode.nextSibling);
      finalNode = prevStartNode;
      prevEndNode = prevStartNode.previousSibling as SifrrNodeKeyed<T>;
      prevStartNode = _node;
      prevStart++;
      newEnd--;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = prevStartNode;
      b = newData[newEnd];
    }
  }

  // Fast path for shrink
  if (newEnd < newStart) {
    if (prevStart <= prevEnd) {
      let next: ChildNode;
      while (prevStart <= prevEnd) {
        if (prevEnd === 0) {
          parent.removeChild(prevEndNode);
        } else {
          next = prevEndNode.previousSibling as SifrrNodeKeyed<T>;
          parent.removeChild(prevEndNode);
          prevEndNode = next as SifrrNodeKeyed<T>;
        }
        prevEnd--;
      }
    }
    return returnNodes;
  }

  // Fast path for add
  if (prevEnd < prevStart) {
    if (newStart <= newEnd) {
      while (newStart <= newEnd) {
        const d = newData[newStart]!;
        _node = (isComment(d) ? d : createFn(d)[0]!) as SifrrNodeKeyed<T>;
        _node.key = d.key;

        returnNodes[newStart] = _node;
        parent.insertBefore(_node, finalNode!);
        newStart++;
      }
    }
    return returnNodes;
  }

  const oldKeys = new Array(newEnd + 1 - newStart),
    newKeys = new Map(),
    nodes = new Array(prevEnd - prevStart + 1),
    toDelete = [];

  for (let i = newStart; i <= newEnd; i++) {
    // Positions for reusing nodes from current DOM state
    oldKeys[i] = -1;
    // Index to resolve position from current to new
    if (!newData[i]?.key) {
      window.console.error(`Key is missing for index ${i},  props: `, newData[i]);
    }
    if (newData[i]?.key) newKeys.set(newData[i]!.key, i);
  }

  let reusingNodes = 0;
  while (prevStart <= prevEnd) {
    if (newKeys.has(prevStartNode.key)) {
      oldKeys[newKeys.get(prevStartNode.key)] = prevStart;
      reusingNodes++;
    } else {
      toDelete.push(prevStartNode);
    }
    nodes[prevStart] = prevStartNode;
    prevStartNode = prevStartNode.nextSibling as SifrrNodeKeyed<T>;
    prevStart++;
  }

  // Remove extra nodes
  for (const node of toDelete) {
    parent.removeChild(node);
  }

  // Fast path for full replace
  if (reusingNodes === 0) {
    for (let i = newStart; i <= newEnd; i++) {
      // Add extra nodes
      const d = newData[i]!;
      returnNodes[i] = (isComment(d) ? d : createFn(d)[0]!) as SifrrNodeKeyed<T>;
      returnNodes[i]!.key = newData[i]!.key;

      parent.insertBefore(returnNodes[i] as Node, prevStartNode!);
    }
    return returnNodes;
  }

  const longestSeq = longestPositiveIncreasingSubsequence(oldKeys, newStart);

  let lisIdx = longestSeq.length - 1,
    tmpD: SifrrNodeKeyed<T>;
  for (let i = newEnd; i >= newStart; i--) {
    if (longestSeq[lisIdx] === i) {
      finalNode = nodes[oldKeys[i]];
      returnNodes[i] = finalNode;
      // returnNodes[i] = finalNode; reused nodes, not needed to set key
      makeEqual(finalNode, newData[i]! as SifrrNode<T>);
      lisIdx--;
    } else {
      if (oldKeys[i] === -1) {
        const d = newData[i]!;
        tmpD = (isComment(d) ? d : createFn(d)[0]!) as SifrrNodeKeyed<T>;
        tmpD.key = newData[i]!.key;
      } else {
        tmpD = nodes[oldKeys[i]];
        makeEqual(tmpD, newData[i] as SifrrNode<T>);
      }
      returnNodes[i] = tmpD;
      parent.insertBefore(tmpD, finalNode);
      finalNode = tmpD;
    }
  }

  return returnNodes;
}

// Picked from
// https://github.com/adamhaile/surplus/blob/master/src/runtime/content.ts#L368

// return an array of the indices of ns that comprise the longest increasing subsequence within ns
export function longestPositiveIncreasingSubsequence(ns: number[], newStart: number): number[] {
  const seq: number[] = [],
    is = [],
    pre = new Array(ns.length);
  let l = -1;

  for (let i = newStart, len = ns.length; i < len; i++) {
    const n = ns[i];
    if (n! < 0) continue;
    const j = findGreatestIndexLEQ(seq, n!);
    if (j !== -1) pre[i] = is[j];
    if (j === l) {
      l++;
      seq[l] = n!;
      is[l] = i;
    } else if (n! < seq[j + 1]!) {
      seq[j + 1] = n!;
      is[j + 1] = i;
    }
  }

  for (let i = is[l]; l > -1; i = pre[i!], l--) {
    seq[l] = i!;
  }

  return seq;
}

function findGreatestIndexLEQ(seq: number[], n: number): number {
  // invariant: lo is guaranteed to be index of a value <= n, hi to be >
  // therefore, they actually start out of range: (-1, last + 1)
  let lo = -1,
    hi = seq.length;

  // fast path for simple increasing sequences
  if (hi > 0 && seq[hi - 1]! <= n) return hi - 1;

  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (seq[mid]! > n) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return lo;
}
