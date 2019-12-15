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
  Element = 2
}

// TODO: separate based on type
export type SifrrBindMap =
  {
      type: SifrrBindType.Text;
      text: BindingFxn;
    }
  | {
      type: SifrrBindType.Element;
      text?: BindingFxn;
      se?: any;
      events?: EventMap;
      props?: PropMap;
      attributes?: AttributeMap;
      state?: BindingFxn;
    };

export type SifrrRef = {
  idx: number;
  ref: SifrrBindMap;
};

export type SifrrFunctionMap = Map<string, BindingFxn>

export default {};
