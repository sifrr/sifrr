const UrlExt = require('./utils/url');
const JsonExt = require('./utils/json');

// Empty SifrrDom
let SifrrDom = {};

// For elements
SifrrDom.elements = {};

// Classes
SifrrDom.Element = require('./dom/element');
SifrrDom.Parser = require('./dom/parser');
SifrrDom.makeEqual = require('./dom/makeequal');
SifrrDom.Loader = require('./dom/loader');
SifrrDom.SimpleElement = require('./dom/simpleelement');
SifrrDom.Event = require('./dom/event');

// Register Custom Element Function
SifrrDom.register = (Element, options) => {
  Element.useShadowRoot = SifrrDom.config.useShadowRoot;
  const name = Element.elementName;
  if (!name) {
    window.console.error('Error creating Custom Element: No name given.', Element);
  } else if (window.customElements.get(name)) {
    window.console.warn(`Error creating Element: ${name} - Custom Element with this name is already defined.`);
  } else if (name.indexOf('-') < 1) {
    window.console.error(`Error creating Element: ${name} - Custom Element name must have one dash '-'`);
  } else {
    try {
      window.customElements.define(name, Element, options);
      SifrrDom.elements[name] = Element;
      return true;
    } catch (error) {
      window.console.error(`Error creating Custom Element: ${name} - ${error}`);
      return false;
    }
  }
  return false;
};

// Initialize SifrrDom
SifrrDom.setup = function(config) {
  SifrrDom.config = Object.assign({
    baseUrl: '',
    useShadowRoot: true
  }, config);
  SifrrDom.Event.add('input');
  SifrrDom.Event.add('change');
  SifrrDom.Event.addListener('change', 'document', SifrrDom.Parser.twoWayBind);
  SifrrDom.Event.addListener('input', 'document', SifrrDom.Parser.twoWayBind);
};

// Load Element HTML and execute script in it
SifrrDom.load = function(elemName, config = { baseUrl: SifrrDom.config.baseUrl }) {
  let loader = new SifrrDom.Loader(elemName, config);
  return loader.executeScripts();
};

SifrrDom.Url = UrlExt;
SifrrDom.Json = JsonExt;
// Relative path to element html
SifrrDom.relativeTo = function(elemName, relativeUrl) {
  if (typeof elemName === 'string') return SifrrDom.Url.absolute(SifrrDom.Loader.urls[elemName], relativeUrl);
};

module.exports = SifrrDom;
