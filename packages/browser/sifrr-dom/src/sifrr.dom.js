const UrlExt = require('./utils/url');

let SifrrDom = {};
SifrrDom.elements = {};
SifrrDom.Element = require('./dom/element');
SifrrDom.Parser = require('./dom/parser');
SifrrDom.makeEqual = require('./dom/makeequal');
SifrrDom.Loader = require('./dom/loader');
SifrrDom.register = function(Element) {
  Element.useShadowRoot = SifrrDom.config.useShadowRoot;
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
      SifrrDom.elements[name] = Element;
      return true;
    } catch (error) {
      window.console.warn(`Error creating Custom Element: ${name} - ${error}`);
      return false;
    }
  }
  return false;
};
SifrrDom.addEvent = require('./dom/event');
SifrrDom.setup = function(config) {
  SifrrDom.config = Object.assign({
    baseUrl: '/',
    useShadowRoot: true
  }, config);
  SifrrDom.addEvent('input');
  SifrrDom.addEvent('change');
  window.document.$input = SifrrDom.Parser.twoWayBind;
  window.document.$change = SifrrDom.Parser.twoWayBind;
};
SifrrDom.SimpleElement = require('./dom/simpleelement');
SifrrDom.load = function(elemName, config = { baseUrl: SifrrDom.config.baseUrl }) {
  let loader = new SifrrDom.Loader(elemName, config);
  loader.executeScripts();
};
SifrrDom.relativeTo = function(elemName, relativeUrl) {
  return UrlExt.absolute(SifrrDom.Loader.urls[elemName], relativeUrl);
}

module.exports = SifrrDom;
