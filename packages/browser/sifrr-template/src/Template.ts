import { createTemplateFromString, functionMapCreator } from './utils';
import { create } from './ref';
import { SifrrBindMap, SifrrRef, SifrrFunctionMap } from './types';
import creator from './creator';

class Template {
  template: HTMLTemplateElement;
  functionMap: SifrrFunctionMap;
  refMap: SifrrRef[];

  constructor(str: TemplateStringsArray, substitutions: any[]) {
    const { functionMap, mergedString } = functionMapCreator(str, substitutions);
    this.functionMap = functionMap;
    this.template = createTemplateFromString(mergedString);
    this.refMap = create(this.template.content, creator, this.functionMap)
  }
}

export default Template;
