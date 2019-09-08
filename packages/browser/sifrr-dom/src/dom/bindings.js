import { OUTER_REGEX, STATE_REGEX } from './constants';

export function replacer(match) {
  let f;
  if (match.indexOf('return ') > -1) {
    f = match;
  } else {
    f = 'return ' + match;
  }
  try {
    return new Function(f);
  } catch (e) {
    window.console.log(`Error processing binding: \`${f}\``);
    window.console.error(e);
    return '';
  }
}

export function evaluate(fxn, el) {
  try {
    if (typeof fxn === 'string') return fxn;
    else return fxn.call(el);
  } catch (e) {
    const str = fxn.toString();
    window.console.log(
      `Error evaluating: \`${str.slice(str.indexOf('{') + 1, str.lastIndexOf('}'))}\` for element`,
      el
    );
    window.console.error(e);
  }
}

export const getBindingFxns = string => {
  const splitted = string.split(OUTER_REGEX),
    l = splitted.length,
    ret = [];
  for (let i = 0; i < l; i++) {
    if (splitted[i][0] === '$' && splitted[i][1] === '{') {
      ret.push(replacer(splitted[i].slice(2, -1)));
    } else if (splitted[i]) ret.push(splitted[i]);
  }
  if (ret.length === 1) return ret[0];
  return ret;
};

export const getStringBindingFxn = string => {
  const match = string.match(STATE_REGEX);
  if (match) return match[1];
  return getBindingFxns(string);
};

export const evaluateBindings = (fxns, element) => {
  if (typeof fxns === 'function') return evaluate(fxns, element);
  return fxns.map(fxn => evaluate(fxn, element)).join('');
};
