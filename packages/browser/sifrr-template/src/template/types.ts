export interface SifrrNode<T> extends Node {
  __sifrrRefs?: SifrrRefCollection<T>[];
  __tempNum?: number;
  key?: string | number;
  onPropChange?: (prop: string, oldValue: any, newValue: any) => void;
}

export type SifrrProps<T> = T & {
  nodeType?: number;
};

export type SifrrKeyedProps<T> = SifrrProps<T> & {
  key: string | number;
};

export type ChildNodeKeyed = ChildNode & {
  key: string | number;
};

type _RTValue = null | undefined | string | Node | _RTValue[];
export type DomBindingReturnValue = (_RTValue | NodeList) & {
  isRendered?: boolean;
  reference?: Node;
};

export type SifrrNodesArray<T> = (SifrrNode<T> | SifrrNodesArray<T>)[];

export type BindingFxn<T, O, N> = (props: SifrrProps<T>, oldValue: O) => N | Promise<N>;

// clone/update a template element
export type SifrrCreateFunction<T> = (
  parent: SifrrProps<T>,
  oldValue?: SifrrNode<T>[]
) => SifrrNode<T>[];

export enum SifrrBindType {
  Text = 1,
  Prop = 2,
  DirectProp = 3,
  Attribute = 4
}

export type SifrrBindMap<T> =  // T = props type of parent
  | {
      type: SifrrBindType.Text;
      value: BindingFxn<T, SifrrNodesArray<T>, DomBindingReturnValue>;
    }
  | {
      type: SifrrBindType.Attribute;
      name: string;
      value: BindingFxn<T, string | false | null | undefined, string | false | null | undefined>;
    }
  | {
      type: SifrrBindType.Prop;
      name: string;
      value: BindingFxn<T, any, any>;
    }
  | {
      type: SifrrBindType.DirectProp;
      name: string;
      value: any;
      set: boolean;
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
export type SifrrFunctionMap<T> = Map<string, BindingFxn<T, any, any> | any>; // T = props type of parent

// create bind map for a base template
export type SifrrBindCreatorFxn<T> = (
  // T = props type of parent
  el: HTMLElement,
  functionMap: SifrrFunctionMap<T>
) => SifrrBindMap<T>[] | 0;

export default {};
