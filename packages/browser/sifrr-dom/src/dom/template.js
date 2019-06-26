const { TEMPLATE } = require('./constants');

module.exports = (str, ...extra) => {
  if (str.tagName && str.tagName === 'TEMPLATE') return str;
  let isString = false;
  const tmp = TEMPLATE();
  if (typeof str === 'string') {
    isString = true;
    if (typeof extra[0] === 'string') str = `<style>${extra.join('')}</style>${str}`;
  } else if (Array.isArray(str) && typeof str[0] === 'string') {
    isString = true;
    str = String.raw(str, ...extra);
  } else if (str instanceof NodeList || (Array.isArray(str) && str[0].nodeType)) {
    Array.from(str).forEach(s => {
      tmp.content.appendChild(s);
    });
  } else if (str.nodeType) {
    tmp.content.appendChild(str);
  } else {
    throw Error('Argument must be of type string | template literal | Node | [Node] | NodeList');
  }
  if (isString) tmp.innerHTML = str.replace(/(\\)?\$(\\)?\{/g, '${');
  return tmp;
};
