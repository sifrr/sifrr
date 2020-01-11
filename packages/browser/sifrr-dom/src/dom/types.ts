declare global {
  interface Document {
    $: (selector: string) => Element;
    $$: (selector: string) => NodeList;
  }

  interface HTMLElement {
    $(selector: string, sr?: boolean): Element;
    $$(selector: string, sr?: boolean): NodeList;
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

export declare var SifrrElement: {
  new (): ISifrrElement;
  prototype: ISifrrElement;
  elementName: string;
};

export default {};
