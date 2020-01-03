import { TEMPLATE, PREFIX, BIND_REF_LENGTH } from './constants';
import createUniqueString from '../ustring';
import { SifrrFunctionMap, SifrrNode, SifrrProps } from './types';

export const createTemplateFromString = (str: string): HTMLTemplateElement => {
  const template = TEMPLATE();
  template.innerHTML = str;
  return template;
};

export function functionMapCreator<T>(str: TemplateStringsArray, substitutions: any[]) {
  const raw = str.raw;
  const functionMap: SifrrFunctionMap<T> = new Map();
  const mergedString = raw
    .map((chunk, i) => {
      const subs = substitutions[i - 1];
      if (subs === undefined) {
        return chunk;
      }
      if (typeof subs === 'function') {
        subs.type = subs.type;
        const randomString = createUniqueString(BIND_REF_LENGTH);
        functionMap.set(randomString, subs);
        return `{{${PREFIX + randomString}}}` + chunk;
      }
      return substitutions[i - 1] + chunk;
    })
    .join('');

  return {
    mergedString,
    functionMap
  };
}

export function arrayOf<T>(a: any): T[] {
  return Array.prototype.slice.call(a);
}

export function isSifrrNode(node: SifrrNode<any> | SifrrProps<any>): boolean {
  return !!node.__tempNum;
}

export function isSameSifrrNode<T>(nodes: SifrrNode<T>[], tempNums: number[]) {
  const ln = nodes.length,
    tl = tempNums.length;

  if (ln !== tl) return false;
  for (let i = 0; i < ln; i++) {
    if (nodes[i].__tempNum !== tempNums[i]) return false;
  }
  return true;
}

export function recurseArray<T, X>(
  values: any | any[],
  singleValFxn: (a: T) => any,
  createFn?: (a: X) => T[]
): T | T[] {
  if (!Array.isArray(values)) {
    const createdV = createFn ? createFn(<X>values) : <T>values;
    if (Array.isArray(createdV)) {
      return recurseArray(createdV, singleValFxn);
    } else {
      return singleValFxn(createdV);
    }
  }

  const l = values.length,
    retV = [];
  for (let i = 0; i < l; i++) {
    retV.push(recurseArray(values[i], singleValFxn, createFn));
  }
  return retV;
}

export function flattenOperation<T, X>(
  ovs: any[],
  nvs: any[],
  equaliser: (oldv: T, newv: T | X) => T,
  removeFxn: (old: T) => void,
  addFxn: (newv: T) => T,
  shouldCreate?: (newv: X | T) => boolean,
  createFn?: (newv: X) => T[]
) {
  type TRArray = (T | TRArray)[];
  type TXRArray = (T | X | TRArray)[];
  const oldValues = <TRArray>ovs;
  const newValues = <TXRArray>nvs;

  const newL = newValues.length;
  const oldL = oldValues.length;

  const returnValues = new Array(newL);

  // Lesser now
  if (oldL > newL) {
    let i = oldL - 1;
    while (i > newL - 1) {
      recurseArray(oldValues[i], removeFxn);
      i--;
    }
  }

  let i = 0;
  // Make old children equal to new children
  while (i < oldL && i < newL) {
    const ov = oldValues[i];
    const nv = newValues[i];
    if (!Array.isArray(ov) && !Array.isArray(nv)) {
      returnValues[i] = equaliser(ov, nv);
    } else if (Array.isArray(ov) && Array.isArray(nv)) {
      returnValues[i] = flattenOperation(
        ov,
        nv,
        equaliser,
        removeFxn,
        addFxn,
        shouldCreate,
        createFn
      );
    } else if (Array.isArray(ov) && !Array.isArray(nv)) {
      returnValues[i] = flattenOperation(
        ov,
        [nv],
        equaliser,
        removeFxn,
        addFxn,
        shouldCreate,
        createFn
      )[0];
    } else if (!Array.isArray(ov) && Array.isArray(nv)) {
      returnValues[i] = <T[]>(
        flattenOperation([ov], nv, equaliser, removeFxn, addFxn, shouldCreate, createFn)
      );
    }
    i++;
  }

  // Add extra new children
  while (i < newL) {
    returnValues[i] = recurseArray<T, X>(newValues[i], addFxn, createFn);
    i++;
  }

  return <TRArray>returnValues;
}

export function flatLastElement<T>(vs: any[]): T {
  type TRArray = (T | TRArray)[];
  const values = <TRArray>vs;
  let i = values.length - 1,
    last: T,
    lastArray: T | TRArray;

  while (last === undefined && i > -1) {
    lastArray = values[i];
    while (lastArray && last === undefined) {
      if (Array.isArray(lastArray)) {
        lastArray = lastArray[lastArray.length - 1];
      } else {
        last = lastArray;
      }
    }
    i--;
  }
  return <T>last;
}
