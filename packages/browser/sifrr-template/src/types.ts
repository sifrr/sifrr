export type DomBindingReturnValue =
  | string
  | HTMLElement
  | NodeList
  | HTMLElement[]
  | HTMLTemplateElement
  | string[];

export type BindingFxn = (oldValue: DomBindingReturnValue) => DomBindingReturnValue;

export type EventMap = Array<[number, BindingFxn]>;
export type PropMap = Array<[string, BindingFxn]>;
export type AttributeMap = Array<[string, 1, BindingFxn] | [string, 0, string]>;

export enum SifrrBindType {
  Text = 1,
  Prop = 2,
  Attribute = 3
}

// TODO: separate based on type
export type SifrrBindMap =
  | {
      type: SifrrBindType.Text;
      value: BindingFxn;
    }
  | {
      type: SifrrBindType.Attribute;
      name: string;
      value: BindingFxn;
    }
  | {
      type: SifrrBindType.Prop;
      name: string;
      value: BindingFxn;
      direct: boolean;
    };

export type SifrrRef = {
  idx: number;
  ref: SifrrBindMap[];
};

export type SifrrFunctionMap = Map<string, BindingFxn>;

export type SifrrBindCreatorFxn = (
  el: HTMLElement,
  functionMap: SifrrFunctionMap
) => SifrrBindMap[] | 0;

export default {};
