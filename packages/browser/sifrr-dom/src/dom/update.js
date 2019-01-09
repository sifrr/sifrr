// Attribute related gotchas
function updateAttribute(element, name, newValue) {
  if (name === 'class') {
    const fromValue = element.className;
    if (fromValue != newValue) {
      // values are always cast to strings
      if (newValue == 'null' || newValue == 'undefined' || newValue == 'false' || !newValue) {
        element.className = '';
      } else {
        element.className = newValue;
      }
    }
  } else {
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
    if ((element.nodeName == 'SELECT' || element.nodeName == 'INPUT') && name == 'value') element.value = newValue;
  }
}

module.exports = {
  updateAttribute
};
