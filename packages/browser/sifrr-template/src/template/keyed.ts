/* eslint-disable max-lines */
import { makeEqual } from './makeequal';
import {
  ChildNodeKeyed,
  SifrrCreateFunction,
  SifrrNode,
  SifrrKeyedProps,
  DomBindingReturnValue
} from './types';
import { flatLastElement } from './utils';

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
// TODO: cleanup
export function makeChildrenEqualKeyed<T>(
  oldChildren: ChildNodeKeyed[],
  newData: SifrrKeyedProps<T>[],
  createFn: SifrrCreateFunction<T>
) {
  const newL = newData.length,
    oldL = oldChildren.length;

  const lastChild: ChildNode =
    (<DomBindingReturnValue>oldChildren).reference || flatLastElement(oldChildren);
  const nextSib = lastChild && lastChild.nextSibling;
  const parent = lastChild.parentNode;
  const returnNodes = new Array(newL);

  if (!parent) {
    throw Error(
      'Parent should be given of there were no Child Nodes Before. Open an issue on sifrr/sifrr if you think this is a bug.'
    );
  }

  (<DomBindingReturnValue>returnNodes).reference = (<DomBindingReturnValue>oldChildren).reference;
  // special case of no value return
  if (returnNodes.length < 1 && !(<DomBindingReturnValue>returnNodes).reference) {
    const referenceComment = document.createComment('Sifrr Reference Comment. Do not delete.');
    (<DomBindingReturnValue>returnNodes).reference = referenceComment;
    parent.insertBefore(referenceComment, lastChild);
  }

  if (oldL === 0) {
    for (let i = 0; i < newL; i++) {
      const n = createFn(newData[i])[0];
      n.key = newData[i].key;
      returnNodes[i] = n;
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
    prevStartNode = oldChildren[0],
    prevEndNode = oldChildren[oldL - 1],
    finalNode,
    a: any,
    b: any,
    _node: SifrrNode<T>;

  fixes: while (loop) {
    loop = false;

    // Skip prefix
    (a = prevStartNode), (b = newData[newStart]);
    while (b && a.key === b.key) {
      returnNodes[newStart] = makeEqual(prevStartNode, b);
      prevStart++;
      prevStartNode = <ChildNodeKeyed>prevStartNode.nextSibling;
      newStart++;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      (a = prevStartNode), (b = newData[newStart]);
    }

    // Skip suffix
    (a = prevEndNode), (b = newData[newEnd]);
    while (b && a.key === b.key) {
      returnNodes[newEnd] = makeEqual(prevEndNode, b);
      prevEnd--;
      finalNode = prevEndNode;
      prevEndNode = <ChildNodeKeyed>prevEndNode.previousSibling;
      newEnd--;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      (a = prevEndNode), (b = newData[newEnd]);
    }

    // Fast path to swap backward
    (a = prevEndNode), (b = newData[newStart]);
    while (b && a.key === b.key) {
      loop = true;
      returnNodes[newStart] = makeEqual(prevEndNode, b);
      _node = prevEndNode.previousSibling;
      parent.insertBefore(prevEndNode, prevStartNode);
      prevEndNode = <ChildNodeKeyed>_node;
      prevEnd--;
      newStart++;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      (a = prevEndNode), (b = newData[newStart]);
    }

    // Fast path to swap forward
    (a = prevStartNode), (b = newData[newEnd]);
    while (b && a.key === b.key) {
      loop = true;
      returnNodes[newEnd] = makeEqual(prevStartNode, b);
      _node = prevStartNode.nextSibling;
      parent.insertBefore(prevStartNode, prevEndNode.nextSibling);
      finalNode = prevStartNode;
      prevEndNode = <ChildNodeKeyed>prevStartNode.previousSibling;
      prevStartNode = <ChildNodeKeyed>_node;
      prevStart++;
      newEnd--;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      (a = prevStartNode), (b = newData[newEnd]);
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
          next = <ChildNodeKeyed>prevEndNode.previousSibling;
          parent.removeChild(prevEndNode);
          prevEndNode = <ChildNodeKeyed>next;
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
        _node = createFn(newData[newStart])[0];
        _node.key = newData[newStart].key;

        returnNodes[newStart] = _node;
        parent.insertBefore(_node, finalNode);
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
    newKeys.set(newData[i].key, i);
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
    prevStartNode = <ChildNodeKeyed>prevStartNode.nextSibling;
    prevStart++;
  }

  // Remove extra nodes
  for (let i = 0; i < toDelete.length; i++) {
    parent.removeChild(toDelete[i]);
  }

  // Fast path for full replace
  if (reusingNodes === 0) {
    for (let i = newStart; i <= newEnd; i++) {
      // Add extra nodes
      returnNodes[i] = createFn(newData[i])[0];
      returnNodes[i].key = newData[i].key;

      parent.insertBefore(returnNodes[i], prevStartNode);
    }
    return returnNodes;
  }

  const longestSeq = longestPositiveIncreasingSubsequence(oldKeys, newStart);

  let lisIdx = longestSeq.length - 1,
    tmpD: SifrrNode<T>;
  for (let i = newEnd; i >= newStart; i--) {
    if (longestSeq[lisIdx] === i) {
      finalNode = nodes[oldKeys[i]];
      returnNodes[i] = finalNode;
      // returnNodes[i] = finalNode; reused nodes, not needed to set key
      makeEqual(finalNode, newData[i]);
      lisIdx--;
    } else {
      if (oldKeys[i] === -1) {
        tmpD = createFn(newData[i])[0];
        tmpD.key = newData[i].key;
      } else {
        tmpD = nodes[oldKeys[i]];
        makeEqual(tmpD, newData[i]);
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
export function longestPositiveIncreasingSubsequence(ns: number[], newStart: number) {
  const seq = [],
    is = [],
    pre = new Array(ns.length);
  let l = -1;

  for (let i = newStart, len = ns.length; i < len; i++) {
    const n = ns[i];
    if (n < 0) continue;
    const j = findGreatestIndexLEQ(seq, n);
    if (j !== -1) pre[i] = is[j];
    if (j === l) {
      l++;
      seq[l] = n;
      is[l] = i;
    } else if (n < seq[j + 1]) {
      seq[j + 1] = n;
      is[j + 1] = i;
    }
  }

  for (let i = is[l]; l > -1; i = pre[i], l--) {
    seq[l] = i;
  }

  return seq;
}

function findGreatestIndexLEQ(seq: number[], n: number) {
  // invariant: lo is guaranteed to be index of a value <= n, hi to be >
  // therefore, they actually start out of range: (-1, last + 1)
  let lo = -1,
    hi = seq.length;

  // fast path for simple increasing sequences
  if (hi > 0 && seq[hi - 1] <= n) return hi - 1;

  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (seq[mid] > n) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return lo;
}
