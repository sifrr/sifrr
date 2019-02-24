const { OUTER_REGEX, STATE_REGEX } = require('./constants');

function replacer(match) {
  let f;
  if (match.indexOf('return ') >= 0) {
    f = match;
  } else {
    f = 'return ' + match;
  }
  try {
    return new Function(f);
  } catch(e) {
    window.console.log(`Error processing binding: \`${f}\``);
    return '';
  }
}

function evaluate(fxn, el) {
  try {
    if (typeof fxn === 'string') return fxn;
    else return fxn.call(el);
  } catch(e) {
    const str = fxn.toString();
    window.console.log(`Error evaluating: \`${str.slice(str.indexOf('{') + 1, str.lastIndexOf('}'))}\` for element`, el);
    window.console.error(e);
  }
}

const Bindings = {
  getBindingFxns: (string) => {
    const splitted = string.split(OUTER_REGEX), l = splitted.length, ret = [];
    for (let i = 0; i < l; i++) {
      if (splitted[i][0] === '$' && splitted[i][1] === '{') {
        ret.push(replacer(splitted[i].slice(2, -1)));
      } else if (splitted[i]) ret.push(splitted[i]);
    }
    if (ret.length === 1) return ret[0];
    return ret;
  },
  getStringBindingFxn: (string) => {
    const match = string.match(STATE_REGEX);
    if (match) return match[1];
    return Bindings.getBindingFxns(string);
  },
  evaluateBindings: (fxns, element) => {
    if (typeof fxns === 'function') return evaluate(fxns, element);
    return fxns.map(fxn => evaluate(fxn, element)).join('');
  },
  evaluate: evaluate,
  replacer: replacer
};

module.exports = Bindings;
