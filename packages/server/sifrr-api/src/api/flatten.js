module.exports = (attrs, separator = ', ') => {
  const str = [];
  for (let attr in attrs) {
    str.push(`${attr}: ${attrs[attr]}`);
  }
  return str.join(separator);
};
