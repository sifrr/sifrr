import { Ref } from '@/template/ref';

export type SifrrNode<T> =
  | (ChildNode & {
      __sifrrBindingss?: SifrrBindingCollection<T>[];
      __tempNum?: number;
      key?: string | number;
      onPropChange?: (prop: string, oldValue: unknown, newValue: unknown) => void;
      update?: () => void;
      [x: string]: unknown;
    })
  | (Text & {
      __tempNum?: number;
    });

export type SifrrProps<T> = T;

export type SifrrKeyedProps<T> = SifrrProps<T> & {
  key: string | number;
};

export type ChildNodeKeyed = ChildNode & {
  key: string | number;
};

type _RTValue = null | undefined | string | number | boolean | Node | DomBindingReturnArrayValue;
export type DomBindingReturnArrayValue = (NodeList | _RTValue[]) & {
  isRendered?: boolean;
  reference?: Node;
};
export type DomBindingReturnValue = _RTValue | DomBindingReturnArrayValue;

export type SifrrNodesArray<T> = SifrrNode<T>[] & {
  reference?: Node;
  isRendered?: boolean;
  update?: (p: SifrrProps<T>) => void;
};

export type SifrrNodesArrayKeyed<T> = (SifrrNode<T> & { key: string | number })[] & {
  reference?: Node;
  isRendered?: boolean;
  update?: (p: SifrrProps<T>) => void;
};

export type BindingFxn<T, O, N> = (props: SifrrProps<T>, oldValue: O) => N | Promise<N>;

// clone/update a template element
export type SifrrCreateFunction<T> = (
  parent: SifrrProps<T>,
  oldValue?: SifrrNode<T>[],
  refs?: Ref<any>[]
) => SifrrNodesArray<T>;

export enum SifrrBindType {
  Text = 1,
  Prop = 2,
  DirectProp = 3,
  Attribute = 4,
  If = 5,
  Event = 6
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
        type: SifrrBindType.Event;
        name: string;
        value: BindingFxn<T, (e: Event) => void, (e: Event) => void>;
      }
    | {
        type: SifrrBindType.If;
        value: BindingFxn<T, boolean, boolean>;
      }
    | {
        type: SifrrBindType.DirectProp;
        name: string;
        value: any;
      };

// ref map for each base template element
export type SifrrBinding<T> = {
  // T = props type of parent
  idx: number;
  map: SifrrBindMap<T>[];
};

// collection of ref for each sifrr template element
export type SifrrBindingCollection<T> = {
  // T = props type of parent
  node: HTMLElement & {
    [x: string]: unknown;
  };
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

export type CssProperties = Partial<
  Omit<
    CSSStyleDeclaration,
    | 'length'
    | 'parentRule'
    | 'getPropertyPriority'
    | 'getPropertyValue'
    | 'item'
    | 'removeProperty'
    | 'setProperty'
    | number
  >
>;

export default {};
