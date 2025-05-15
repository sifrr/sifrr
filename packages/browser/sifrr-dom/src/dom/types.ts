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
  sifrrClone: (state: object) => ISifrrElement;
  state?: object;
  defaultState?: object;
  update: () => void;
  setState(state: any): void;
  setProps(props: object): void;
}

export interface EventListener {
  __dom?: HTMLElement;
}

export interface SifrrEventListener {
  (ev: Event, target: HTMLElement, dom: HTMLElement): void;
  __dom?: HTMLElement;
}

export declare const SifrrElement: {
  new (): ISifrrElement;
  prototype: ISifrrElement;
  elementName: string;
};

export default {};
