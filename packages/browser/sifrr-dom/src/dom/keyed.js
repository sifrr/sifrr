/* eslint-disable max-lines */
const { makeEqual } = require('./makeequal');

// Inspired from https://github.com/Freak613/stage0/blob/master/reconcile.js
// This is almost straightforward implementation of reconcillation algorithm
// based on ivi documentation:
// https://github.com/localvoid/ivi/blob/2c81ead934b9128e092cc2a5ef2d3cabc73cb5dd/packages/ivi/src/vdom/implementation.ts#L1366
// With some fast paths from Surplus implementation:
// https://github.com/adamhaile/surplus/blob/master/src/runtime/content.ts#L86
//
// How this implementation differs from others, is that it's working with data directly,
// without maintaining nodes arrays, and uses manipukates dom only when required

function makeChildrenEqualKeyed(parent, newData, createFn = (x) => x, key) {
  const oldL = parent.childNodes.length,
    newL = newData.length;

  // Fast path for clear
  if (newL === 0) {
    parent.textContent = '';
    return;
  }

  // Fast path for create
  if (oldL === 0) {
    for(let i = 0; i < newL; i++) {
      parent.appendChild(createFn(newData[i]));
    }
    return;
  }

  const oldChildren = Array.prototype.slice.call(parent.childNodes), oldData = oldChildren.map(n => n.state);

  // reconciliation
  let prevStart = 0,
    newStart = 0,
    loop = true,
    prevEnd = oldL - 1, newEnd = newL - 1,
    prevStartNode = prevStart,
    prevEndNode = prevEnd,
    a, b;

  fixes: while(loop) {
    loop = false;

    // Skip prefix
    a = oldData[prevStart], b = newData[newStart];
    while(a[key] === b[key]) {
      makeEqual(oldChildren[prevStart], b);
      prevStart++;
      newStart++;
      prevStartNode++;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = oldData[prevStart], b = newData[newStart];
    }

    // Skip suffix
    a = oldData[prevEnd], b = newData[newEnd];
    while(a[key] === b[key]) {
      makeEqual(oldChildren[prevEnd], newData[newEnd]);
      prevEnd--;
      newEnd--;
      prevEndNode--;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = oldData[prevEnd], b = newData[newEnd];
    }

    // Fast path to swap backward
    a = oldData[prevEnd], b = newData[newStart];
    while(a[key] === b[key]) {
      loop = true;
      makeEqual(oldChildren[prevEnd], b);
      parent.insertBefore(oldChildren[prevEndNode], oldChildren[prevStartNode]);
      prevEnd--;
      newStart++;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = oldData[prevEnd], b = newData[newStart];
    }

    // Fast path to swap forward
    a = oldData[prevStart], b = newData[newEnd];
    while(a[key] === b[key]) {
      loop = true;
      makeEqual(oldChildren[prevStart], b);
      parent.insertBefore(oldChildren[prevStartNode], oldChildren[prevEndNode + 1]);
      prevStart++;
      prevEndNode--;
      prevStartNode++;
      newEnd--;
      if (prevEnd < prevStart || newEnd < newStart) break fixes;
      a = oldData[prevStart], b = newData[newEnd];
    }
  }

  // Fast path for shrink
  if (newEnd < newStart) {
    if (prevStart <= prevEnd) {
      while(prevStart <= prevEnd) {
        parent.removeChild(oldChildren[prevEnd]);
        prevEnd--;
      }
    }
    return;
  }

  // Fast path for add
  if (prevEnd < prevStart) {
    if (newStart <= newEnd) {
      while(newStart <= newEnd) {
        parent.appendChild(createFn(newData[newStart]));
        newStart++;
      }
    }
    return;
  }

  const oldKeys = new Array(newEnd + 1 - newStart), newKeys = new Map();

  // Positions for reusing nodes from current DOM state
  for(let i = newStart; i <= newEnd; i++) oldKeys[i] = -1;

  // Index to resolve position from current to new
  for (let i = newStart; i <= newEnd; i++) {
    newKeys.set(newData[i][key], i);
  }

  let reusingNodes = 0, toDelete = [];
  for(let i = prevStart; i <= prevEnd; i++) {
    if (newKeys.has(oldData[i][key])) {
      oldKeys[newKeys.get(oldData[i][key])] = i;
      reusingNodes++;
    } else {
      toDelete.push(i);
    }
  }

  // Fast path for full replace
  if (reusingNodes === 0) {
    for(let i = newStart; i <= newEnd; i++) {
      // Add extra nodes
      if (i > prevEnd) parent.appendChild(createFn(newData[i]));
      else makeEqual(oldChildren[i], newData[i]);
    }
    // Remove extra nodes
    if (newEnd < prevEnd) {
      while (newEnd < prevEnd) {
        parent.removeChild(oldChildren[prevEnd]);
        prevEnd--;
      }
    }
    return;
  }

  const longestSeq = longestPositiveIncreasingSubsequence(oldKeys, newStart);

  // Collect nodes to work with them
  const nodes = [];
  let tmpC = prevStart;
  for(let i = prevStart; i <= prevEnd; i++) {
    nodes[i] = oldChildren[tmpC];
    tmpC++;
  }

  for(let i = 0; i < toDelete.length; i++) {
    parent.removeChild(nodes[toDelete[i]]);
  }

  let lisIdx = longestSeq.length - 1, tmpD;
  prevEnd = oldChildren[prevEnd];
  for(let i = newEnd; i >= newStart; i--) {
    if(longestSeq[lisIdx] === i) {
      prevEnd = nodes[oldKeys[longestSeq[lisIdx]]];
      makeEqual(prevEnd, newData[i]);
      lisIdx--;
    } else {
      if (oldKeys[i] === -1) {
        tmpD = createFn(newData[i]);
      } else {
        tmpD = nodes[oldKeys[i]];
        makeEqual(tmpD, newData[i]);
      }
      parent.insertBefore(tmpD, prevEnd);
      prevEnd = tmpD;
    }
  }
}

// Picked from
// https://github.com/adamhaile/surplus/blob/master/src/runtime/content.ts#L368

// return an array of the indices of ns that comprise the longest increasing subsequence within ns
function longestPositiveIncreasingSubsequence(ns, newStart) {
  let seq = [],
    is  = [],
    l   = -1,
    pre = new Array(ns.length);

  for (let i = newStart, len = ns.length; i < len; i++) {
    let n = ns[i];
    if (n < 0) continue;
    let j = findGreatestIndexLEQ(seq, n);
    if (j !== -1) pre[i] = is[j];
    if (j === l) {
      l++;
      seq[l] = n;
      is[l]  = i;
    } else if (n < seq[j + 1]) {
      seq[j + 1] = n;
      is[j + 1] = i;
    }
  }

  for (let i = is[l]; l >= 0; i = pre[i], l--) {
    seq[l] = i;
  }

  return seq;
}

function findGreatestIndexLEQ(seq, n) {
  // invariant: lo is guaranteed to be index of a value <= n, hi to be >
  // therefore, they actually start out of range: (-1, last + 1)
  let lo = -1,
    hi = seq.length;

  // fast path for simple increasing sequences
  if (hi > 0 && seq[hi - 1] <= n) return hi - 1;

  while (hi - lo > 1) {
    let mid = Math.floor((lo + hi) / 2);
    if (seq[mid] > n) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return lo;
}

module.exports = {
  makeChildrenEqualKeyed,
  longestPositiveIncreasingSubsequence
};
