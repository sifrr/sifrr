let SifrrDOM = {};
SifrrDOM.elements = {};
SifrrDOM.Element = require('./dom/element');
SifrrDOM.Parser = require('./dom/parser');
SifrrDOM.makeEqual = require('./dom/makeequal');
SifrrDOM.Loader = require('./dom/loader');
SifrrDOM.register = function(Element) {
  const name = Element.elementName;
  if (!name) {
    window.console.warn('Error creating Custom Element: No name given.', Element);
  } else if (window.customElements.get(name)) {
    window.console.warn(`Error creating Element: ${name} - Custom Element with this name is already defined.`);
  } else if (name.indexOf('-') < 1) {
    window.console.warn(`Error creating Element: ${name} - Custom Element name must have one dash '-'`);
  } else {
    try {
      window.customElements.define(name, Element);
      SifrrDOM.elements[name] = Element;
      return true;
    } catch (error) {
      window.console.warn(`Error creating Custom Element: ${name} - ${error}`);
      return false;
    }
  }
  return false;
};
SifrrDOM.addEvent = require('./dom/event');
SifrrDOM.setup = function() {
  SifrrDOM.addEvent('input');
  SifrrDOM.addEvent('blur');
  window.document.$input = SifrrDOM.Parser.twoWayBind;
  window.document.$blur = SifrrDOM.Parser.twoWayBind;
};
SifrrDOM.load = function(elemName) {
  let loader = new SifrrDOM.Loader(elemName);
  loader.executeScripts();
};

module.exports = SifrrDOM;
