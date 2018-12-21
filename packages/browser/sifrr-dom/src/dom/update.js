// Attribute related gotchas
function updateAttribute(element, name, newValue) {
  const fromValue = element.getAttribute(name);
  if (fromValue != newValue) {
    // values are always cast to strings
    if (newValue == 'null' || newValue == 'undefined' || newValue == 'false' || !newValue) {
      if (!element.hasAttribute(name)) element.removeAttribute(name);
    } else {
      element.setAttribute(name, newValue);
    }
  }

  // select's value doesn't change on changing value attribute
  if (element.nodeName == 'SELECT' && name == 'value') element.value = newValue;
}

module.exports = {
  updateAttribute: updateAttribute,
};
