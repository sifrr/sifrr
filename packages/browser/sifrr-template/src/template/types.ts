declare global {
  interface HTMLTemplateElement {
    refs?: SifrrRefCollection[];
    parent?: TemplateParent;
    props?: object;
  }

  interface Node {
    __sifrrTemplate?: HTMLTemplateElement;
    __oldRenderIf?: boolean;
    __sifrrOldDisplay?: string;
    __oldData?: string;
  }
}

export type TemplateParent =
  | {
      __sifrrTemplate?: HTMLTemplateElement;
      readonly nodeType: false;
    }
  | HTMLElement;

export type TemplateParentKeyed = TemplateParent & {
  key: string | number;
};

export type ChildNodeKeyed = ChildNode & {
  key: string | number;
};

export type SifrrNode = null | undefined | string | Node | SifrrNode[];

export type DomBindingReturnValue = SifrrNode | NodeList;

export type SifrrNodeValue = Node[];

export type BindingFxn<T> = (parent: TemplateParent, oldValue: DomBindingReturnValue) => T;

export enum SifrrBindType {
  Text = 1,
  Prop = 2,
  Attribute = 3
}

export type SifrrBindMap =
  | {
      type: SifrrBindType.Text;
      value: BindingFxn<DomBindingReturnValue>;
    }
  | {
      type: SifrrBindType.Attribute;
      name: string;
      value: BindingFxn<string | false | null | undefined>;
    }
  | {
      type: SifrrBindType.Prop;
      name: string;
      value: BindingFxn<any>;
      direct: boolean;
    };

// ref map for each base template element
export type SifrrRef = {
  idx: number;
  map: SifrrBindMap[];
};

// collection of ref for each sifrr template element
export type SifrrRefCollection = {
  node: Node;
  bindMap: SifrrBindMap[];
  currentValues: DomBindingReturnValue[];
};

// uid -> fxn
export type SifrrFunctionMap = Map<string, BindingFxn<any>>;

// create bind map for a base template
export type SifrrBindCreatorFxn = (
  el: HTMLElement,
  functionMap: SifrrFunctionMap
) => SifrrBindMap[] | 0;

// clone a base tempalte element
export type SifrrCloneFunction = (parent?: TemplateParent) => HTMLTemplateElement;

export default {};
