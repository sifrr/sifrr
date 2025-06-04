import { elName, props } from '@/dom/symbols';
import { SifrrCreateFunction } from '@sifrr/template';

declare global {
  interface Element {
    $: typeof Element.prototype.querySelector;
    $$: typeof Element.prototype.querySelectorAll;
  }

  interface Document {
    $: typeof Document.prototype.querySelector;
    $$: typeof Document.prototype.querySelectorAll;
  }
}

export interface ISifrrElement extends HTMLElement {
  update: () => void;
  setProps(props: object): void;
}

export interface EventListener {
  __dom?: HTMLElement;
}

export interface SifrrEventListener {
  (ev: Event, target: HTMLElement, dom: HTMLElement): void;
  __dom?: HTMLElement;
}

export interface SifrrElementKlass<K extends ISifrrElement> {
  [elName]?: string;
  [props]?: Set<string>;
  new (): K;
  prototype: K;
  elementName: string;
  n: string;
  template: SifrrCreateFunction<any>;
  dependencies?: SifrrElementKlass<any>[];
}

export default {};
