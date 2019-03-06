const { TEMPLATE } = require('./constants');

module.exports = (str, ...extra) => {
  const tmp = TEMPLATE();
  if (typeof str === 'string') {
    // nothing
  } else if (str[0] && typeof str[0] === 'string') {
    str = String.raw(str, ...extra);
  } else if (str[0]) {
    Array.from(str).forEach((s) => {
      tmp.content.appendChild(s);
    });
    return tmp;
  } else if (str.nodeType && !str.content) {
    tmp.content.appendChild(str);
    return tmp;
  } else {
    return str;
  }
  str = str
    .replace(/(\\)?\$(\\)?\{/g, '${');
  tmp.innerHTML = str;
  return tmp;
};
