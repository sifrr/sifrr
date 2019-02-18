const { OUTER_REGEX } = require('./constants');

function replacer(match) {
  let f;
  if (match.indexOf('return ') >= 0) {
    f = match;
  } else {
    f = 'return ' + match;
  }
  return new Function(f);
}

function evaluate(fxn, el) {
  try {
    if (typeof fxn === 'string') return fxn;
    else return fxn.call(el) || '';
  } catch(e) {
    window.console.error(e);
    window.console.log(`Error evaluating: \`${fxn}\` for element`, el);
  }
}

module.exports = {
  getBindingFxns: (string) => {
    const splitted = string.split(OUTER_REGEX), l = splitted.length, ret = [];
    for (let i = 0; i < l; i++) {
      if (splitted[i][0] === '$' && splitted[i][1] === '{') {
        ret.push(replacer(splitted[i].slice(2, -1)));
      } else if (splitted[i]) ret.push(splitted[i]);
    }
    return ret;
  },
  evaluateBindings: (fxns, element) => {
    if (fxns.length === 1) {
      return evaluate(fxns[0], element);
    }
    return fxns.map(fxn => evaluate(fxn, element)).join('');
  },
  evaluate: evaluate,
  replacer: replacer
};
