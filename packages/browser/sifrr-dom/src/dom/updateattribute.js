// Attribute related gotchas
module.exports = (element, name, newValue) => {
  if (newValue === false || newValue === null || newValue === undefined) element.hasAttribute(name) && element.removeAttribute(name);
  else {
    const fromValue = element.getAttribute(name);
    if (fromValue !== newValue) {
      if (name === 'class') element.className = newValue;
      else element.setAttribute(name, newValue);
    }
  }

  // select/input's value doesn't change on changing value attribute
  if (name == 'value' && (element.nodeName == 'SELECT' || element.nodeName == 'INPUT')) element.value = newValue;
};
