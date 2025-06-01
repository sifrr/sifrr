import Element from './dom/element';
import { createElement, register, elements } from './dom/createElement';

// Initialize SifrrDom
function setup() {
  HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
  HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
  document.$ = document.querySelector;
  document.$$ = document.querySelectorAll;
}

export { Element, register, setup, elements, createElement };
export * from './dom/types';
