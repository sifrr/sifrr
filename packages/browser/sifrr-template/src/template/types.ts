declare global {
  interface Node {
    __sifrrTemplate?: SifrrNode<any>;
    __oldRenderIf?: boolean;
    __sifrrOldDisplay?: string;
    __oldData?: string;
  }
}

export interface SifrrNode<T> extends Node {
  __sifrrRefs?: SifrrRefCollection<T>[];
}

export type SifrrProps<T> = T & {
  __sifrrTemplate?: SifrrNode<T>;
  __sifrrBaseTemplate?: HTMLTemplateElement;
  __oldRenderIf?: boolean;
  __sifrrOldDisplay?: string;
  nodeType?: number;
};

export type TemplateParentKeyed<T> = SifrrProps<T> & {
  key: string | number;
};

export type ChildNodeKeyed = ChildNode & {
  key: string | number;
};

type _RTValue = null | undefined | string | Node | _RTValue[];
export type DomBindingReturnValue = _RTValue | NodeList;

type _NA<T> = SifrrNode<T>[] | SifrrNode<T>;
export type SifrrNodes<T> = _NA<T>[];

export type BindingFxn<T, Y> = (parent: SifrrProps<T>, oldValue: DomBindingReturnValue) => Y;

// clone/update a template element
export type SifrrCreateFunction<T> = (
  parent: SifrrProps<T>,
  oldValue?: SifrrNodes<T>
) => SifrrNodes<T>;

export enum SifrrBindType {
  Text = 1,
  Prop = 2,
  Attribute = 3
}

export type SifrrBindMap<T> =  // T = props type of parent
  | {
      type: SifrrBindType.Text;
      value: BindingFxn<T, SifrrNodes<T>>;
    }
  | {
      type: SifrrBindType.Attribute;
      name: string;
      value: BindingFxn<T, string | false | null | undefined>;
    }
  | {
      type: SifrrBindType.Prop;
      name: string;
      value: BindingFxn<T, any>;
      direct: boolean;
    };

// ref map for each base template element
export type SifrrRef<T> = {
  // T = props type of parent
  idx: number;
  map: SifrrBindMap<T>[];
};

// collection of ref for each sifrr template element
export type SifrrRefCollection<T> = {
  // T = props type of parent
  node: Node;
  bindMap: SifrrBindMap<T>[];
  currentValues: any[];
};

// uid -> fxn
export type SifrrFunctionMap<T> = Map<string, BindingFxn<T, any>>; // T = props type of parent

// create bind map for a base template
export type SifrrBindCreatorFxn<T> = (
  // T = props type of parent
  el: HTMLElement,
  functionMap: SifrrFunctionMap<T>
) => SifrrBindMap<T>[] | 0;

export default {};
