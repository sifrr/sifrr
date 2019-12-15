import Template from './Template';

export { default as createUniqueString } from './ustring';
export const createTemplate = (str: TemplateStringsArray, ...subs: any[]) => new Template(str, subs)
