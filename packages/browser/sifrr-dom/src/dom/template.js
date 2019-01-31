const { TEMPLATE } = require('./constants');

module.exports = (str, ...extra) => {
  const tmp = TEMPLATE();
  if (typeof str === 'string') {
    tmp.innerHTML = str.replace(/{{(.*)}}/g, '${$1}');
  } else if (str[0] && typeof str[0] === 'string') {
    str = String.raw(str, ...extra).replace(/{{(.*)}}/g, '${$1}');
    tmp.innerHTML = str;
  } else if (str[0]) {
    Array.from(str).forEach((s) => {
      tmp.appendChild(s);
    });
  } else {
    return str;
  }
  return tmp;
};
