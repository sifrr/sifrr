// Attribute related gotchas
module.exports = (element, name, newValue) => {
  if (newValue === false || newValue === null || newValue === undefined) element.hasAttribute(name) && element.removeAttribute(name);
  else if (name === 'class') element.className = newValue;
  else if ((name === 'id' || name === 'value') && element[name] !== newValue) element[name] = newValue;
  else if (element.getAttribute(name) !== newValue) element.setAttribute(name, newValue);
};
