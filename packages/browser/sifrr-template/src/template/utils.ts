import { TEMPLATE, PREFIX, BIND_REF_LENGTH } from './constants';
import createUniqueString from '../ustring';
import { SifrrFunctionMap, SifrrNode } from './types';

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
        return `\${${PREFIX + randomString}}` + chunk;
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

export function isSifrrNode(node: SifrrNode<any>): boolean {
  return !!node.__sifrrRefs;
}
