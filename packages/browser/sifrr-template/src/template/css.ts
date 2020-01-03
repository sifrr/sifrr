import createTemplate from './create';
import bindTemplate from '../binders/bindtemplate';

export default function css(str: TemplateStringsArray, ...substitutions: any[]) {
  const raw: string[] & { raw?: readonly string[] } = [...str.raw];
  raw.unshift('<style>');
  raw.push('</style>');
  raw.raw = raw;
  return createTemplate(<TemplateStringsArray>raw, '', ...substitutions, '');
}
