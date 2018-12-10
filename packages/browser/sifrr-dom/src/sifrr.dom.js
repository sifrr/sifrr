let SifrrDOM = {};
SifrrDOM.elements = {};
SifrrDOM.Element = require('./dom/element');
SifrrDOM.Vdom = require('./dom/vdom');
SifrrDOM.register = function(Element) {
  const name = Element.elementName;
  if (!name) {
    console.log('Error creating Custom Element: No name given.');
  } else if (window.customElements.get(name)) {
    console.log(`Error creating Element: ${name} - Custom Element with this name is already defined.`);
  } else if (name.indexOf('-') < 1) {
    console.log(`Error creating Element: ${name} - Custom Element name must have one dash '-'`);
  } else {
    try {
      window.customElements.define(name, Element);
      SifrrDOM.elements[name] = Element;
      return true;
    } catch (error) {
      console.log(`Error creating Custom Element: ${name} - ${error}`);
      return false;
    }
  }
  return false;
};

module.exports = SifrrDOM;
