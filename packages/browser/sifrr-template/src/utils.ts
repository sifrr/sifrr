import { TEMPLATE, PREFIX, BIND_REF_LENGTH } from './template/constants';
import createUniqueString from './ustring';
import { SifrrFunctionMap } from './template/types';

export const createTemplateFromString = (str: string): HTMLTemplateElement => {
  const template = TEMPLATE();
  template.innerHTML = str;
  return template;
};

export const functionMapCreator = (str: TemplateStringsArray, substitutions: any[]) => {
  const raw = str.raw;
  const functionMap: SifrrFunctionMap = new Map();
  const mergedString = raw
    .map((chunk, i) => {
      const subs = substitutions[i - 1];
      if (subs === undefined) {
        return chunk;
      }
      if (typeof subs === 'function') {
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
};

/**
 * Compares two object shallowly
 * @param target target
 * @param source new value to be merged in old value
 */
export const shallowEqual = (target: any, source: any) => {
  if (typeof target !== 'object') return target !== source;
  if (target === null || source === null) return target === source;
  for (const key in source) {
    if (!(key in target) || target[key] !== source[key]) return true;
  }
  return false;
};

export function arrayOf<T>(a: any): T[] {
  return Array.prototype.slice.call(a);
}
