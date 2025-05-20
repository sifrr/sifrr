import { makeChildrenEqual } from './makeequal';
import updateAttribute from './updateattribute';
import { COMMENT_NODE, REFERENCE_COMMENT, TEXT_NODE } from './constants';
import { SifrrBindType, SifrrNode, SifrrProps, SifrrBindMap, SifrrNodesArray } from './types';
import getNodesFromBindingValue from './getnodes';
import { isText } from '@/template/utils';

const emptyObj = Object.freeze(Object.create(null));

export default function update<T>(
  tempElement: SifrrNodesArray<T> | SifrrNode<T>,
  props: SifrrProps<T>
): void {
  if (Array.isArray(tempElement)) {
    const l = tempElement.length;
    for (let i = 0; i < l; i++) {
      update(tempElement[i]!, props);
    }
    return;
  }

  if (isText(tempElement)) return;

  const { __sifrrRefs: refs } = tempElement;
  if (!props || !refs) return;

  // Update nodes
  for (let i = refs.length - 1; i > -1; --i) {
    const { node, bindMap, currentValues, bindingSet } = refs[i]!;

    let promise = false;
    for (let j = bindMap.length - 1; j > -1; --j) {
      const binding = bindMap[j]!;

      // special direct props (events/style)
      if (binding.type === SifrrBindType.DirectProp) {
        if (!bindingSet[j]) {
          bindingSet[j] = true;
          if (binding.name === 'style') {
            const newValue = binding.value ?? emptyObj;
            const keys = Object.keys(newValue),
              len = keys.length;

            for (let i = 0; i < len; i++) {
              const key = keys[i]!;
              newValue[key] = `${newValue[key] ?? ''}`; // remove undefined with empty string
            }
            Object.assign((node as unknown as HTMLElement).style, newValue);
          } else node[binding.name] = binding.value;
          if (typeof node.onPropChange === 'function')
            node.onPropChange?.(binding.name, undefined, binding.value);
        }
        continue;
      }
      const oldValue = currentValues[j];
      const newValue = binding.value(props, oldValue);

      // if v-show
      if (binding.type === SifrrBindType.Show) {
        const newValue = binding.value(props, oldValue);
        if (newValue !== currentValues[j]) {
          currentValues[j] = newValue;
          node.style.display = newValue ? '' : 'none';
        }
      }

      // v-if
      if (binding.type === SifrrBindType.If) {
        if (newValue !== currentValues[j]) {
          if (!newValue) {
            const comment = REFERENCE_COMMENT();
            currentValues[j] = comment;
            node.replaceWith(comment);
            break;
          } else {
            const comment = currentValues[j];
            if (comment && comment.nodeType === COMMENT_NODE) {
              comment.replaceWith(node);
              currentValues[j] = node;
            }
          }
        }
      }

      if (newValue instanceof Promise) {
        promise = true;
        newValue.then((nv) => {
          currentValues[j] = updateOne(node, binding, oldValue, nv);
        });
      } else {
        currentValues[j] = updateOne(node, binding, oldValue, newValue);
      }
    }
    if (promise) {
      Promise.all(currentValues).then(() =>
        typeof node.update === 'function' ? node.update?.() : ''
      );
    } else if (typeof node.update === 'function') node.update?.();
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
    if (binding.name === 'style') {
      newValue = newValue ?? emptyObj;
      const newKeys = Object.keys(newValue),
        oldKeys = Object.keys(oldValue),
        newl = newKeys.length,
        oldl = oldKeys.length;
      for (let i = 0; i < oldl; i++) {
        const oKey = oldKeys[i]!;
        if (!newValue[oKey]) {
          (node.style as any)[oKey as any] = ''; // remove if newValue doesn't have that property
        }
      }
      // add new properties
      for (let i = 0; i < newl; i++) {
        const nKey = newKeys[i]!;
        if (oldValue[nKey] !== newValue[nKey]) {
          (node.style as any)[nKey as any] = `${newValue[nKey]}`;
        }
      }
    } else {
      oldValue = node[binding.name];
      node[binding.name] = newValue;
    }
    if (oldValue !== newValue) node.onPropChange?.(binding.name, oldValue, newValue);
  }
  return newValue;
}
