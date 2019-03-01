module.exports = (attrs, separator = ', ', addDescription = false) => {
  const str = [];
  for (let attr in attrs) {
    if (addDescription && attrs[attr].description) str.push(`"""${attrs[attr].description}"""`);
    str.push(`${attr}: ${attrs[attr].type}`);
  }
  return str.join(separator);
};
