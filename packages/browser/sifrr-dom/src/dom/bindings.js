const { REGEX } = require('./constants');

function replacer(match) {
  if (match.indexOf('${') < 0) return match;
  let f;
  if (match.indexOf('return ') >= 0) {
    f = match;
  } else {
    f = 'return ' + match;
  }
  return new Function(f);
}

module.exports = {
  getBindingFxn: (string) => {
    return replacer(string);
  },
  getBindingFxns: (string) => {
    const splitted = string.split(REGEX), l = splitted.length, ret = new Array(l);
    for (let i = 0; i < l; i++) {
      ret[i] = replacer(splitted[i]);
    }
  }
};
