export interface SifrrNode<T> extends Node {
  __sifrrRefs?: SifrrRefCollection<T>[];
  __tempNum?: number;
  key?: string | number;
  onPropChange?: (prop: string, oldValue: any, newValue: any) => void;
  update?: () => void;
  [x: string]: any;
}

export type SifrrProps<T> = T & {
  nodeType?: number;
  [x: string]: any;
};

export type SifrrKeyedProps<T> = SifrrProps<T> & {
  key: string | number;
};

export type ChildNodeKeyed = ChildNode & {
  key: string | number;
};

type _RTValue = null | undefined | string | Node | _RTValue[];
export type DomBindingReturnArrayValue = (NodeList | _RTValue[]) & {
  isRendered?: boolean;
  reference?: Node;
};
export type DomBindingReturnValue =
  | _RTValue
  | (NodeList & {
      isRendered?: boolean;
      reference?: Node;
    });

export type SifrrNodesArray<T> = (SifrrNode<T> | SifrrNodesArray<T>)[] & {
  reference?: Node;
  isRendered?: boolean;
};

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

export type SifrrBindMap<T> = // T = props type of parent

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
  node: SifrrNode<unknown>;
  bindMap: SifrrBindMap<T>[];
  currentValues: any[];
  bindingSet: any[];
};

// uid -> fxn
export type SifrrFunctionMap<T> = Map<string, BindingFxn<T, any, any> | any>; // T = props type of parent

// create bind map for a base template
export type SifrrBindCreatorFxn<T> = (
  // T = props type of parent
  el: Node,
  functionMap: SifrrFunctionMap<T>
) => SifrrBindMap<T>[] | 0;

export default {};
