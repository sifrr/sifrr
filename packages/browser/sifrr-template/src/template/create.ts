import { createTemplateFromString, functionMapCreator, arrayOf } from './utils';
import { create, collect, cleanEmptyNodes } from './ref';
import { SifrrProps, SifrrCreateFunction, SifrrNode } from './types';
import creator from './creator';
import update from './update';
import { makeChildrenEqual } from './makeequal';

const createTemplate = <T>(
  str: TemplateStringsArray,
  ...substitutions: any[]
): SifrrCreateFunction<T> => {
  const { functionMap, mergedString } = functionMapCreator<T>(str, substitutions);
  const template = createTemplateFromString(mergedString);
  cleanEmptyNodes(template.content);

  const childNodes = arrayOf<ChildNode>(template.content.childNodes),
    nodesLength = childNodes.length;
  const refMaps = childNodes.map(cn => {
    cn.remove();
    return create<T>(cn, creator, functionMap);
  });

  const clone = (props: SifrrProps<T>): SifrrNode<T>[] => {
    const newNodes: SifrrNode<T>[] = new Array(nodesLength);

    for (let i = 0; i < childNodes.length; i++) {
      newNodes[i] = <SifrrNode<T>>childNodes[i].cloneNode(true);
      if (refMaps[i].length < 1) continue;

      newNodes[i].__sifrrRefs = collect(newNodes[i], refMaps[i]);
      update(newNodes[i], props);
    }
    return newNodes;
  };

  // cloning this template, can be used as binding function in another template
  const createFxn = (props: SifrrProps<T>, oldValue?: SifrrNode<T>[]) => {
    if (oldValue) {
      return <SifrrNode<T>[]>makeChildrenEqual(oldValue, [props], clone);
    }
    return clone(props);
  };

  return createFxn;
};

export default createTemplate;
