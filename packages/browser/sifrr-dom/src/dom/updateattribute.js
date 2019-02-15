// Attribute related gotchas
module.exports = (element, name, newValue) => {
  const fromValue = element.getAttribute(name);
  if (fromValue != newValue) {
    element.setAttribute(name, newValue);
  }

  // select/input's value doesn't change on changing value attribute
  if (name == 'value' && (element.nodeName == 'SELECT' || element.nodeName == 'INPUT')) element.value = newValue;
};
