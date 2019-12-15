import { TEMPLATE, PREFIX, BIND_REF_LENGTH } from './constants';
import createUniqueString from './ustring';
import { SifrrFunctionMap } from './types';

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
