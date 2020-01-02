import createTemplate from './create';
import bindTemplate from '../binders/bindtemplate';

export default function css(str: TemplateStringsArray, ...substitutions: any[]) {
  (<string[]>str.raw).unshift('<style>');
  (<string[]>str.raw).push('</style>');
  return bindTemplate.bind(null, createTemplate(str, '', ...substitutions, ''));
}
