import { OUTER_REGEX, STATE_REGEX } from './constants';
import { BindingFxns, BindingFxn, DomBindingReturnValue } from './types';

function replacer(match: string) {
  let f: string;
  if (match.indexOf('return ') > -1) {
    f = match;
  } else {
    f = 'return ' + match;
  }
  try {
    return <BindingFxn>new Function(f);
  } catch (e) {
    window.console.log(`Error processing binding: \`${f}\``);
    window.console.error(e);
    return '';
  }
}

function evaluate(el: HTMLElement, fxn: Function | string): string {
  try {
    if (typeof fxn !== 'function') return fxn;
    else return fxn.call(el);
  } catch (e) {
    const str = fxn.toString();
    window.console.log(
      `Error evaluating: \`${str.slice(str.indexOf('{') + 1, str.lastIndexOf('}'))}\` for element`,
      el
    );
    window.console.error(e);
    return '';
  }
}

export const getBindingFxns = (text: string): BindingFxns => {
  const splitted = text.split(OUTER_REGEX),
    l = splitted.length,
    ret: BindingFxn[] = [];
  for (let i = 0; i < l; i++) {
    if (splitted[i][0] === '$' && splitted[i][1] === '{') {
      ret.push(replacer(splitted[i].slice(2, -1)));
    } else if (splitted[i]) ret.push(splitted[i]);
  }
  if (ret.length === 1) return ret[0];
  return ret;
};

export const getStringBindingFxn = (string: string) => {
  const match = string.match(STATE_REGEX);
  if (match) return match[1];
  return getBindingFxns(string);
};

export const evaluateBindings = (
  fxns: BindingFxns,
  element: HTMLElement
): DomBindingReturnValue => {
  if (typeof fxns === 'function') return evaluate(element, fxns);
  if (typeof fxns === 'string') return fxns;
  const binded = evaluate.bind(null, element);
  return fxns.map(binded).join('');
};
