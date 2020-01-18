import Element from './dom/element';
import Loader from './dom/loader';
import * as Event from './dom/event';
import config from './dom/config';
import createElement from './dom/createElement';
import { SifrrElement } from './dom/types';

// Caches
const elements = Object.create(null);
const loadingElements = Object.create(null);
const registering = Object.create(null);

// Register Custom Element Function
function register(
  Element: typeof SifrrElement,
  {
    name,
    dependsOn,
    ...options
  }: {
    name?: string;
    dependsOn?: string | string[];
  } & ElementDefinitionOptions = {}
) {
  name = name || Element.elementName;
  if (!name) {
    return Promise.reject(Error('Error creating Custom Element: No name given.'));
  } else if (window.customElements.get(name)) {
    console.warn(
      `Error creating Element: ${name} - Custom Element with this name is already defined.`
    );
    return Promise.resolve(false);
  } else if (name.indexOf('-') < 1) {
    return Promise.reject(
      Error(`Error creating Element: ${name} - Custom Element name must have one hyphen '-'`)
    );
  } else {
    let before: Promise<any>;
    if (Array.isArray(dependsOn)) {
      before = Promise.all(dependsOn.map(en => load(en)));
    } else if (typeof dependsOn === 'string') {
      before = load(dependsOn);
    } else if (typeof before === 'object' && before !== null) {
      before = Promise.all(Object.keys(dependsOn).map(k => load(k, dependsOn[k])));
    } else before = Promise.resolve(true);
    const registeringPromise = before.then(() =>
      window.customElements.define(name, Element, options)
    );
    registering[name] = registeringPromise;
    return registeringPromise
      .then(() => {
        elements[name] = Element;
        delete registering[name];
      })
      .catch(error => {
        throw Error(`Error creating Custom Element: ${name} - ${error.message}`);
      });
  }
}

// Initialize SifrrDom
function setup(newConfig?: typeof config) {
  HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
  HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
  document.$ = document.querySelector;
  document.$$ = document.querySelectorAll;
  Object.assign(config, newConfig);
  config.events.forEach(e => Event.add(e));
}

// Load Element HTML/JS and execute script in it
function load(elemName: string, url = null) {
  if (window.customElements.get(elemName)) {
    return Promise.resolve();
  }
  loadingElements[elemName] = window.customElements.whenDefined(elemName);
  const loader = new Loader(elemName, url);
  return loader
    .executeScripts()
    .then(() => registering[elemName])
    .then(() => {
      if (!window.customElements.get(elemName)) {
        window.console.warn(
          `Executing '${loader.getUrl()}' file didn't register the element with name '${elemName}'. Give correct name to 'load' or fix the file.`
        );
      }
    })
    .finally(() => {
      delete registering[elemName];
      delete loadingElements[elemName];
    });
}

const loading = () => {
  const promises = [];
  for (const el in loadingElements) {
    promises.push(loadingElements[el]);
  }
  return Promise.all(promises);
};

export { Element, Loader, Event, register, setup, load, loading, config, elements, createElement };
export * from './dom/types';

import * as types from './dom/types';
export default {
  Element,
  Loader,
  Event,
  register,
  setup,
  load,
  loading,
  config,
  elements,
  createElement,
  ...types
};
