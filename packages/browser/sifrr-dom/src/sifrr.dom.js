import { BIND_ATTR } from './dom/constants';
import Element from './dom/element';
import twoWayBind from './dom/twowaybind';
import Loader from './dom/loader';
import SimpleElement from './dom/simpleelement';
import * as Event from './dom/event';
import { makeChildrenEqual, makeEqual } from './dom/makeequal';
import { makeChildrenEqualKeyed } from './dom/keyed';
import Store from './dom/store';
import template from './dom/template';
import config from './dom/config';

const bindSelector = '[' + BIND_ATTR + ']';

// Caches
const elements = {};
const loadingElements = {};
const registering = {};

// Register Custom Element Function
const register = (Element, options = {}) => {
  Element.useSR = config.useShadowRoot;
  const name = options.name || Element.elementName;
  if (!name) {
    throw Error('Error creating Custom Element: No name given.', Element);
  } else if (window.customElements.get(name)) {
    console.warn(
      `Error creating Element: ${name} - Custom Element with this name is already defined.`
    );
  } else if (name.indexOf('-') < 1) {
    throw Error(`Error creating Element: ${name} - Custom Element name must have one dash '-'`);
  } else {
    let before;
    if (Array.isArray(options.dependsOn)) {
      before = Promise.all(options.dependsOn.map(en => load(en)));
    } else if (typeof options.dependsOn === 'string') {
      before = load(options.dependsOn);
    } else before = Promise.resolve(true);
    delete options.dependsOn;
    const registeringPromise = before.then(() =>
      window.customElements.define(name, Element, options)
    );
    registering[name] = registering;
    return registeringPromise
      .then(() => {
        elements[name] = Element;
        delete registering[name];
      })
      .catch(error => {
        throw Error(`Error creating Custom Element: ${name} - ${error.message}`);
      });
  }
};

// Initialize SifrrDom
const setup = function(newConfig) {
  HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
  HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
  document.$ = document.querySelector;
  document.$$ = document.querySelectorAll;
  Object.assign(config, newConfig);

  if (typeof config.baseUrl !== 'string') throw Error('baseUrl should be a string');

  config.events.push('input', 'change', 'update');
  config.events.forEach(e => Event.add(e));
  Event.addListener('input', bindSelector, twoWayBind);
  Event.addListener('change', bindSelector, twoWayBind);
  Event.addListener('update', bindSelector, twoWayBind);
};

// Load Element HTML/JS and execute script in it
const load = function(elemName, { url, js = true } = {}) {
  if (window.customElements.get(elemName)) {
    return Promise.resolve(
      window.console.warn(
        `Error loading Element: ${elemName} - Custom Element with this name is already defined.`
      )
    );
  }
  loadingElements[elemName] = window.customElements.whenDefined(elemName);
  let loader = new Loader(elemName, url);
  return loader
    .executeScripts(js)
    .then(() => registering[elemName])
    .then(() => {
      if (!window.customElements.get(elemName)) {
        window.console.warn(`Executing '${elemName}' file didn't register the element.`);
      }
      delete registering[elemName];
      delete loadingElements[elemName];
    })
    .catch(e => {
      delete registering[elemName];
      delete loadingElements[elemName];
      throw e;
    });
};

const loading = () => {
  const promises = [];
  for (let el in loadingElements) {
    promises.push(loadingElements[el]);
  }
  return Promise.all(promises);
};

export {
  Element,
  twoWayBind,
  Loader,
  SimpleElement,
  Event,
  makeChildrenEqual,
  makeChildrenEqualKeyed,
  makeEqual,
  Store,
  template,
  register,
  setup,
  load,
  loading,
  config,
  elements
};

export default {
  Element,
  twoWayBind,
  Loader,
  SimpleElement,
  Event,
  makeChildrenEqual,
  makeChildrenEqualKeyed,
  makeEqual,
  Store,
  template,
  register,
  setup,
  load,
  loading,
  config,
  elements
};
