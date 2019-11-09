declare global {
  interface Window {
    ShadyCSS?: {
      nativeShadow?: boolean;
      prepareTemplate?: (template: HTMLTemplateElement, elementName: string) => void;
    };
  }

  interface Text {
    __data?: string;
  }

  interface Node {
    ___oldRenderIf?: boolean;
    __sifrrOldDisplay?: string | undefined;
    isSifrr?: () => boolean;
    host?: HTMLElement;
    _root?: ISifrrElement;
    root?: ISifrrElement;
  }

  interface Document {
    $: (selector: string) => Element;
    $$: (selector: string) => NodeList;
  }

  interface HTMLElement {
    $(selector: string, sr?: boolean): Element;
    $$(selector: string, sr?: boolean): NodeList;
  }
}

export type BindingFxn = (() => string) | string;
export type BindingFxns = Array<BindingFxn> | BindingFxn;

export type EventMap = Array<[number, BindingFxns]>;
export type PropMap = Array<[string, BindingFxns]>;
export type AttributeMap = Array<[string, 1, BindingFxns] | [string, 0, string]>;

export type SifrrElementInterface = {
  update: () => void;
};

export interface ISifrrElement extends HTMLElement {
  isSifrr: (name?: string) => boolean;
  nodeName: string;
  sifrrClone: (state: any) => ISifrrElement;
  state?: any;
  _sifrrEventSet?: boolean;
  defaultState?: any;
  stateMap?: SifrrRef[];
  stateProps?: {
    setState: (state: any) => void;
  };
  update: () => void;
  setState?(state: any): void;
}

// TODO: separate based on type
export type SifrrStateMap =
  | {
      type: 0;
      text: string;
    }
  | {
      type: 1;
      text: BindingFxns;
    }
  | {
      type: 2 | 3;
      text?: BindingFxns;
      se?: ISifrrElement;
      events?: EventMap;
      props?: PropMap;
      attributes?: AttributeMap;
      state?: BindingFxns;
    };

export type SifrrRef = {
  idx: number;
  ref: SifrrStateMap;
};

export type DomBindingReturnValue =
  | string
  | HTMLElement
  | NodeList
  | HTMLElement[]
  | HTMLTemplateElement
  | string[];

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
  useSR: boolean;
  elementName: string;
};
