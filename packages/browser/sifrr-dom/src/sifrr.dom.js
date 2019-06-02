const { BIND_ATTR } = require('./dom/constants');
const bindSelector = '[' + BIND_ATTR + ']';

// Empty SifrrDom
let SifrrDom = {};

// For elements
SifrrDom.elements = {};
SifrrDom.loadingElements = {};
SifrrDom.registering = [];

// Classes
SifrrDom.Element = require('./dom/element');
SifrrDom.twoWayBind = require('./dom/twowaybind');
SifrrDom.Loader = require('./dom/loader');
SifrrDom.SimpleElement = require('./dom/simpleelement');
SifrrDom.Event = require('./dom/event');
SifrrDom.makeChildrenEqual = require('./dom/makeequal').makeChildrenEqual;
SifrrDom.makeChildrenEqualKeyed = require('./dom/keyed').makeChildrenEqualKeyed;
SifrrDom.makeEqual = require('./dom/makeequal').makeEqual;
SifrrDom.Hook = require('./dom/hook');

// HTML to template
SifrrDom.template = require('./dom/template');

// Register Custom Element Function
SifrrDom.register = (Element, options = {}) => {
  Element.useSR = SifrrDom.config.useShadowRoot;
  const name = Element.elementName;
  if (!name) {
    throw Error('Error creating Custom Element: No name given.', Element);
  } else if (window.customElements.get(name)) {
    global.console.warn(`Error creating Element: ${name} - Custom Element with this name is already defined.`);
  } else if (name.indexOf('-') < 1) {
    throw Error(`Error creating Element: ${name} - Custom Element name must have one dash '-'`);
  } else {
    let before;
    if (Array.isArray(options.dependsOn)) {
      before = Promise.all(options.dependsOn.map(en => SifrrDom.load(en)));
    } else if (typeof options.dependsOn === 'string') {
      before = SifrrDom.load(options.dependsOn);
    } else before = Promise.resolve(true);
    delete options.dependsOn;
    const registering = before.then(() => window.customElements.define(name, Element, options));
    SifrrDom.registering[name] = registering;
    return registering.then(() => {
      SifrrDom.elements[name] = Element;
      delete SifrrDom.registering[name];
    }).catch(error => {
      throw Error(`Error creating Custom Element: ${name} - ${error.message}`);
    });
  }
};

// Initialize SifrrDom
SifrrDom.setup = function(config) {
  HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
  HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
  document.$ = document.querySelector;
  document.$$ = document.querySelectorAll;
  SifrrDom.config = Object.assign({
    baseUrl: '',
    useShadowRoot: true,
    events: []
  }, config);
  if (typeof SifrrDom.config.baseUrl !== 'string') throw Error('baseUrl should be a string');
  SifrrDom.config.events.push('input', 'change', 'update');
  SifrrDom.config.events.forEach(e => SifrrDom.Event.add(e));
  SifrrDom.Event.addListener('input', bindSelector, SifrrDom.twoWayBind);
  SifrrDom.Event.addListener('change', bindSelector, SifrrDom.twoWayBind);
  SifrrDom.Event.addListener('update', bindSelector, SifrrDom.twoWayBind);
  window.Sifrr = window.Sifrr || {};
  window.Sifrr.Dom = window.Sifrr.Dom || SifrrDom;
};

// Load Element HTML and execute script in it
SifrrDom.load = function(elemName, { url, js = true } = {}) {
  if (window.customElements.get(elemName)) { return Promise.resolve(window.console.warn(`Error loading Element: ${elemName} - Custom Element with this name is already defined.`)); }
  SifrrDom.loadingElements[elemName] = window.customElements.whenDefined(elemName);
  let loader = new SifrrDom.Loader(elemName, url);
  return loader.executeScripts(js).then(() => SifrrDom.registering[elemName]).then(() => {
    if (!window.customElements.get(elemName)) {
      window.console.warn(`Executing '${elemName}' file didn't register the element.`);
    }
    delete SifrrDom.registering[elemName];
    delete SifrrDom.loadingElements[elemName];
  }).catch(e => {
    delete SifrrDom.registering[elemName];
    delete SifrrDom.loadingElements[elemName];
    throw e;
  });
};

SifrrDom.loading = () => {
  const promises = [];
  for (let el in SifrrDom.loadingElements) {
    promises.push(SifrrDom.loadingElements[el]);
  }
  return Promise.all(promises);
};

module.exports = SifrrDom;
