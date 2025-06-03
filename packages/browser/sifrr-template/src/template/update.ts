import { makeChildrenEqual } from './makeequal';
import updateAttribute from './updateattribute';
import { REFERENCE_COMMENT, TEXT_NODE } from './constants';
import {
  SifrrBindType,
  SifrrNode,
  SifrrProps,
  SifrrBindMap,
  SifrrNodesArray,
  CssProperties
} from './types';
import getNodesFromBindingValue from './getnodes';
import { isText } from '@/template/utils';

const emptyObj = Object.freeze(Object.create(null));

const getClasses = (
  classList: string | (string | Record<string, boolean>)[] | Record<string, boolean>
): Set<string> => {
  if (typeof classList === 'string') return new Set(classList.split(' '));
  const classes: Set<string> = new Set();
  if (Array.isArray(classList)) {
    classList.forEach((c) => {
      getClasses(c).forEach((l) => classes.add(l));
    });
  } else {
    Object.keys(classList).forEach((c) => {
      classList[c] && classes.add(c);
    });
  }
  return classes;
};

export default function update<T>(
  tempElement: SifrrNodesArray<T> | SifrrNode<T>,
  props: SifrrProps<T>
): void {
  if (Array.isArray(tempElement)) {
    const l = tempElement.length;
    for (let i = 0; i < l; i++) {
      const t = tempElement[i];
      if (isText(t)) continue;
      if (t?.__sifrrBindings && t?.__sifrrBindings.length === 0) continue;
      update(tempElement[i]!, props);
    }
    return;
  }

  if (isText(tempElement)) return;

  const { __sifrrBindings: refs } = tempElement;
  if (!props || !refs) return;

  // Update nodes
  for (let i = refs.length - 1; i > -1; --i) {
    const { node, bindMap, currentValues } = refs[i]!;

    // if
    if (bindMap[0]!.type === SifrrBindType.If) {
      node.ifComment = node.ifComment ?? REFERENCE_COMMENT();
      const ifValue = bindMap[0]!.value(props, currentValues[0]);
      const newValue = ifValue ? node : node.ifComment;
      if (newValue !== currentValues[0]) {
        currentValues[0].replaceWith(newValue);
        currentValues[0] = newValue;
        if (!ifValue) {
          continue;
        }
      }
    }

    for (let j = bindMap.length - 1; j > -1; --j) {
      const binding = bindMap[j]!;

      // skip if handling
      if (binding.type === SifrrBindType.If) {
        continue;
      }

      // special direct props (events/style)
      if (binding.type === SifrrBindType.DirectProp) {
        if (!currentValues[j]) {
          if (binding.name === 'style') {
            const newValue: CssProperties = binding.value ?? emptyObj;
            const keys = Object.keys(newValue) as (keyof CssProperties)[],
              len = keys.length;

            for (let i = 0; i < len; i++) {
              const key = keys[i]!;

              newValue[key] =
                typeof newValue[key] === 'number' ? newValue[key] + 'px' : `${newValue[key] ?? ''}`; // remove undefined/null with empty string
            }
            Object.assign((node as unknown as HTMLElement).style, newValue);
          } else if (binding.name === 'className') {
            getClasses(binding.value).forEach((c) =>
              (node as unknown as HTMLElement).classList.add(c)
            );
          } else node[binding.name] = binding.value;
          currentValues[j] = binding.value;
          if (typeof node.onPropChange === 'function')
            node.onPropChange?.(binding.name, undefined, binding.value);
        }
        continue;
      }
      const oldValue = currentValues[j];
      const newValue = binding.value(props, oldValue);

      if (newValue instanceof Promise) {
        currentValues[j] = newValue.then((nv) => updateOne(node, binding, oldValue, nv));
      } else {
        currentValues[j] = updateOne(node, binding, oldValue, newValue);
      }
    }
    node.update?.();
  }
}

function updateOne<T>(
  node: SifrrNode<any>,
  binding: SifrrBindMap<T>,
  oldValue: any,
  newValue: any
) {
  // text
  if (binding.type === SifrrBindType.Text) {
    if (oldValue === newValue) return oldValue;
    // fast path for one text node
    if (oldValue.length === 1 && oldValue[0].nodeType === TEXT_NODE) {
      if (typeof newValue === 'string' || typeof newValue === 'number') {
        if (oldValue[0].data !== newValue.toString()) oldValue[0].data = newValue; // important to use toString
        return oldValue;
      }
    }

    // fast path for pre-rendered
    if (newValue?.isRendered) {
      return newValue;
    }

    // convert nodeList/HTML collection to array and string/undefined/null to text element
    const nodes = getNodesFromBindingValue<T>(newValue);
    newValue = makeChildrenEqual(oldValue, nodes);
  } else if (binding.type === SifrrBindType.Attribute) {
    updateAttribute(node as unknown as HTMLElement, binding.name, newValue);
  } else if (binding.type === SifrrBindType.Prop && !isText(node)) {
    // special case for style prop
    if (binding.name === 'style' && oldValue !== newValue) {
      newValue = (newValue ?? emptyObj) as CssProperties;
      const newKeys = Object.keys(newValue) as (keyof CssProperties)[],
        oldKeys = Object.keys(oldValue) as (keyof CssProperties)[],
        newl = newKeys.length,
        oldl = oldKeys.length;
      for (let i = 0; i < oldl; i++) {
        const oKey = oldKeys[i]!;
        if (!newValue[oKey]) {
          (node.style as CSSStyleDeclaration).removeProperty(oKey);
        }
      }
      // add new properties
      for (let i = 0; i < newl; i++) {
        const nKey = newKeys[i]!;
        if (oldValue[nKey] !== newValue[nKey]) {
          (node.style as CSSStyleDeclaration).setProperty(
            nKey,
            typeof newValue[nKey] === 'number' ? newValue[nKey] + 'px' : `${newValue[nKey] ?? ''}`
          );
        }
      }
    } else if (binding.name === 'className') {
      newValue = getClasses(newValue);
      (oldValue as Set<string>)?.forEach((c) => {
        if (!(newValue as Set<string>).has(c)) (node as unknown as HTMLElement).classList.remove(c);
      });
      (newValue as Set<string>).forEach((c) => {
        if (!(node as unknown as HTMLElement).classList.contains(c))
          (node as unknown as HTMLElement).classList.add(c);
      });
    } else if (node[binding.name] !== newValue) {
      node[binding.name] = newValue;
    }
    if (oldValue !== newValue) {
      if (typeof node.onPropChange === 'function')
        node.onPropChange(binding.name, oldValue, newValue);
    }
  }
  return newValue;
}
