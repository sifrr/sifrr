import Element from './dom/element';
import { store, getStore } from './dom/store';
import { createElement, register, elements } from './dom/createElement';

// Initialize SifrrDom
function setup() {
  HTMLElement.prototype.$ = HTMLElement.prototype.querySelector;
  HTMLElement.prototype.$$ = HTMLElement.prototype.querySelectorAll;
  document.$ = document.querySelector;
  document.$$ = document.querySelectorAll;
}

export { Element, register, setup, elements, createElement, store, getStore };
export * from './dom/types';
export * from './dom/symbols';
export * from './dom/decorator';
export {
  html,
  cls,
  forNonKeyed,
  forKeyed,
  memo,
  computed,
  type Ref,
  type ComputedRef
} from '@sifrr/template';
