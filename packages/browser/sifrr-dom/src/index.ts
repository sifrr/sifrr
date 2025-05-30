import Element from './dom/element';
import Loader from './dom/loader';
import * as Event from './dom/event';
import createElement from './dom/createElement';
import { SifrrElementKlass } from './dom/types';

// Caches
const elements = Object.create(null);

// Register Custom Element Function
function register(Element: SifrrElementKlass) {
  const name = Element.elementName;
  if (!name) {
    throw Error('Error creating Custom Element: No name given.');
  } else if (window.customElements.get(name)) {
    console.warn(
      `Error creating Element: ${name} - Custom Element with this name is already defined.`
    );
    return false;
  } else if (name.indexOf('-') < 1) {
    throw Error(`Error creating Element: ${name} - Custom Element name must have one hyphen '-'`);
  } else {
    window.customElements.define(name, Element);
    elements[name] = Element;
    return true;
  }
}

// Initialize SifrrDom
function setup() {
  HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
  HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
  document.$ = document.querySelector;
  document.$$ = document.querySelectorAll;
}

export { Element, Loader, Event, register, setup, config, elements, createElement };
export * from './dom/types';
