import { createTemplateFromString, functionMapCreator, isSameSifrrNode, isText } from './utils';
import { create, collect, cleanEmptyNodes } from './ref';
import {
  SifrrProps,
  SifrrCreateFunction,
  SifrrNode,
  DomBindingReturnValue,
  SifrrNodesArray
} from './types';
import creator from './creator';
import update from './update';
import { TEXT_NODE, SIFRR_FRAGMENT, REF_REG } from './constants';
import { Ref } from '@/template/ref-state';

let tempNum = 1;

const createTemplate = <T>(
  str: TemplateStringsArray,
  ...substitutions: ((
    p: any,
    oldValue?: any
  ) => DomBindingReturnValue | Promise<DomBindingReturnValue> | void)[]
): SifrrCreateFunction<T> => {
  const { functionMap, mergedString } = functionMapCreator<T>(str, substitutions);
  const template = createTemplateFromString(mergedString);
  cleanEmptyNodes(template.content);

  const childNodes: ChildNode[] = Array.prototype.slice.call(template.content.childNodes),
    nodeLength = childNodes.length;
  const refMaps = childNodes.map((cn, i) => {
    // special case of binding in topmost element
    if (cn.nodeType === TEXT_NODE && REF_REG.exec((cn as Text).data)) {
      const newFragment = SIFRR_FRAGMENT();
      cn.replaceWith(newFragment);
      newFragment.appendChild(cn);
      childNodes[i] = newFragment;
    }
    const refs = create<T>(childNodes[i]!, creator, functionMap);
    return refs;
  });
  const tempNums = childNodes.map(() => tempNum++);

  const clone = (props: SifrrProps<T>): SifrrNodesArray<T> => {
    // https://jsbench.me/6qk4zc0s9x/1
    const newNodes: SifrrNode<T>[] = new Array(nodeLength);

    for (let i = 0; i < nodeLength; i++) {
      const n = (newNodes[i] = childNodes[i]!.cloneNode(true) as SifrrNode<T>);

      n.__tempNum = tempNums[i];

      if (refMaps[i]!.length < 1 || isText(n)) continue;

      n.__sifrrRefs = collect(newNodes[i]!, refMaps[i]!);
      update(newNodes[i]!, props);
    }
    return newNodes;
  };

  // cloning this template, can be used as binding function in another template
  const createFxn = function (
    props: SifrrProps<T>,
    oldValue?: SifrrNodesArray<T>,
    refs?: Ref<any>[]
  ) {
    if (oldValue) {
      if (isSameSifrrNode(oldValue, tempNums)) {
        update(oldValue, props);
        oldValue.isRendered = true;
        return oldValue;
      } else if (!Array.isArray(oldValue)) {
        console.warn(`oldValue given to Component function was not an Array.
        template: \`${String.raw(str, ...substitutions)}\``);
      } else if (oldValue.length == 1 && oldValue[0]!.nodeType === TEXT_NODE) {
        // do nothing
      } else if (oldValue.length > 0) {
        console.warn(
          `oldValue given to Component function was not created by this Component. 
        This might be a bug or caused if you return different 
        components in same binding function.
        old nodes given:`,
          oldValue,
          `template: \`${String.raw(str, ...substitutions)}\``
        );
      }
    }
    const retValue = clone(props);
    refs?.forEach((ref) => {
      ref.__sifrrWatchers?.push(() => update(retValue, props));
    });

    retValue.update = (p: SifrrProps<T>) => {
      update(retValue, p);
      retValue.isRendered = true;
    };
    return retValue;
  };

  return createFxn;
};

export default createTemplate;
