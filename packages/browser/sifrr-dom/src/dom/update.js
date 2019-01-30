// Attribute related gotchas
function updateAttribute(element, name, newValue) {
  const fromValue = element.getAttribute(name);
  if (fromValue != newValue) {
    // values are always cast to strings
    if (newValue == 'null' || newValue == 'undefined' || newValue == 'false' || !newValue) {
      if (fromValue) element.removeAttribute(name);
    } else {
      element.setAttribute(name, newValue);
    }
  }

  // select/input's value doesn't change on changing value attribute
  if (name == 'value' && (element.nodeName == 'SELECT' || element.nodeName == 'INPUT')) element.value = newValue;
}

module.exports = {
  updateAttribute
};
