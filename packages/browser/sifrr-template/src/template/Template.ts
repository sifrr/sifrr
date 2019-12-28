import { createTemplateFromString, functionMapCreator } from '../utils';
import { create, collect } from './ref';
import { SifrrRef, SifrrFunctionMap, TemplateParent } from './types';
import creator from './creator';
import update from './update';

class Template {
  template: HTMLTemplateElement;
  functionMap: SifrrFunctionMap;
  refMap: SifrrRef[];

  constructor(str: TemplateStringsArray, substitutions: any[]) {
    const { functionMap, mergedString } = functionMapCreator(str, substitutions);
    this.functionMap = functionMap; // maybe not required to save
    this.template = createTemplateFromString(mergedString);
    this.refMap = create(this.template.content, creator, functionMap);
  }

  // cloning a document fragment, used by create in first render. Parent will be used as first argument in binding function.
  clone(parent?: TemplateParent) {
    const temp = <HTMLTemplateElement>this.template.cloneNode(true);
    temp.refs = collect(temp.content, this.refMap);
    if (parent) {
      temp.parent = parent;
      temp.parent.__sifrrTemplate = temp;
    }
    this.update(temp);
    return temp;
  }

  update(temp: HTMLTemplateElement) {
    update(temp);
  }
}

export default Template;
