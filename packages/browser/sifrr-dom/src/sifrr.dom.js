
let SifrrDOM = {};
SifrrDOM.elements = {};
SifrrDOM.Element = require('./dom/element');
SifrrDOM.Parser = require('./dom/parser');
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
SifrrDOM.setup = function(config = {}) {
  class SifrrNode extends HTMLElement {
    static get elementName() {
      return 'sifrr-node';
    }
    connectedCallback() {
      this.style.whiteSpace = 'pre-line';
    }
  }
  SifrrDOM.register(SifrrNode);
  window.document.addEventListener('input', SifrrDOM.Parser.twoWayBind, { capture: true, passive: true });
  window.document.addEventListener('blur', SifrrDOM.Parser.twoWayBind, { capture: true, passive: true });
};
SifrrDOM.load = function(elemName) {
  let loader = new SifrrDOM.Loader(elemName);
  loader.executeScripts();
};

module.exports = SifrrDOM;
