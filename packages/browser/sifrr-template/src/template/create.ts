import { createTemplateFromString, functionMapCreator, isSameSifrrNode } from './utils';
import { create, collect, cleanEmptyNodes } from './ref';
import { SifrrProps, SifrrCreateFunction, SifrrNode, DomBindingReturnValue } from './types';
import creator from './creator';
import update from './update';
import { TEXT_NODE, SIFRR_FRAGMENT } from './constants';

let tempNum = 1;

const createTemplate = <T>(
  str: TemplateStringsArray,
  ...substitutions: any[]
): SifrrCreateFunction<T> => {
  const { functionMap, mergedString } = functionMapCreator<T>(str, substitutions);
  const template = createTemplateFromString(mergedString);
  cleanEmptyNodes(template.content);

  const childNodes = Array.prototype.slice.call(template.content.childNodes),
    nodeLength = childNodes.length;
  const refMaps = childNodes.map(cn => {
    const refs = create<T>(cn, creator, functionMap);
    // special case of binding in topmost element
    if (cn.nodeType === TEXT_NODE && refs.length === 1) {
      const newFragment = SIFRR_FRAGMENT();
      cn.replaceWith(newFragment);
      newFragment.appendChild(cn);
      refs[0].idx++;
    }
    return refs;
  });
  const tempNums = childNodes.map(() => tempNum++);

  const clone = (props: SifrrProps<T>): SifrrNode<T>[] => {
    const newNodes: SifrrNode<T>[] = Array.prototype.slice.call(
      template.content.cloneNode(true).childNodes
    );

    for (let i = 0; i < nodeLength; i++) {
      newNodes[i].__tempNum = tempNums[i];

      if (refMaps[i].length < 1) continue;

      newNodes[i].__sifrrRefs = collect(newNodes[i], refMaps[i]);
      update(newNodes[i], props);
    }
    return newNodes;
  };

  // cloning this template, can be used as binding function in another template
  const createFxn = (props: SifrrProps<T>, oldValue?: SifrrNode<T>[]) => {
    if (oldValue && isSameSifrrNode(oldValue, tempNums)) {
      update(oldValue, props);
      (<DomBindingReturnValue>oldValue).isRendered = true;
      return oldValue;
    }
    return clone(props);
  };

  return createFxn;
};

export default createTemplate;
