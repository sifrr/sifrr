const { TEMPLATE } = require('./constants');

module.exports = (str, ...extra) => {
  const tmp = TEMPLATE();
  if (typeof str === 'string') {
    // nothing
  } else if (Array.isArray(str) && typeof str[0] === 'string') {
    str = String.raw(str, ...extra);
  } else if (str instanceof NodeList || (Array.isArray(str) && str[0].nodeType)) {
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
  str = str.replace(/(\\)?\$(\\)?\{/g, '${');
  tmp.innerHTML = str;
  return tmp;
};
