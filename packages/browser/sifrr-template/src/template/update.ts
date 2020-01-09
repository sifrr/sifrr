import { makeChildrenEqual } from './makeequal';
import updateAttribute from './updateattribute';
import { TEXT_NODE } from './constants';
import { SifrrBindType, SifrrNode, SifrrProps, SifrrBindMap } from './types';
import getNodesFromBindingValue from './getnodes';

const emptyObj = Object.freeze(Object.create(null));

export default function update<T>(
  tempElement: SifrrNode<T> | SifrrNode<T>[],
  props: SifrrProps<T>
) {
  if (Array.isArray(tempElement)) {
    const l = tempElement.length;
    for (let i = 0; i < l; i++) {
      update(tempElement[i], props);
    }
    return;
  }

  const { __sifrrRefs: refs } = tempElement;
  if (!props || !refs) return;

  // Update nodes
  for (let i = refs.length - 1; i > -1; --i) {
    const { node, bindMap, currentValues, bindingSet } = refs[i];
    const hasOnPropChange = typeof (<SifrrNode<any>>node).onPropChange === 'function';
    const hasUpdate = typeof (<SifrrNode<any>>node).update === 'function';

    for (let j = bindMap.length - 1; j > -1; --j) {
      const binding = bindMap[j];

      // special direct props (events/style)
      if (binding.type === SifrrBindType.DirectProp) {
        if (!bindingSet[j]) {
          bindingSet[j] = true;
          if (binding.name === 'style') {
            const newValue = binding.value || emptyObj;
            const keys = Object.keys(newValue),
              len = keys.length;
            for (let i = 0; i < len; i++) {
              (<HTMLElement>node).style[keys[i]] = `${newValue[keys[i]]}`; // remove undefined with empty string
            }
          } else node[binding.name] = binding.value;
        }
        continue;
      }

      const oldValue = currentValues[j];
      if (oldValue instanceof Promise) {
        currentValues[j] = oldValue.then(oldValue => {
          let newValue = binding.value(props, oldValue);

          if (newValue instanceof Promise) {
            return newValue.then(nv => updateOne(node, binding, oldValue, nv, hasOnPropChange));
          } else {
            return updateOne(node, binding, oldValue, newValue, hasOnPropChange);
          }
        });
      } else {
        const oldValue = currentValues[j];
        let newValue = binding.value(props, oldValue);

        if (newValue instanceof Promise) {
          currentValues[j] = newValue.then(nv =>
            updateOne(node, binding, oldValue, nv, hasOnPropChange)
          );
        } else {
          currentValues[j] = updateOne(node, binding, oldValue, newValue, hasOnPropChange);
        }
      }
    }
    hasUpdate && Promise.all(currentValues).then(() => (<SifrrNode<any>>node).update());
  }
}

function updateOne<T>(
  node: Node,
  binding: SifrrBindMap<T>,
  oldValue: any,
  newValue: any,
  hasOnPropChange: boolean
) {
  // text
  if (binding.type === SifrrBindType.Text) {
    if (oldValue === newValue) return oldValue;
    // fast path for one text node
    if (oldValue.length === 1 && oldValue[0].nodeType === TEXT_NODE) {
      if (typeof newValue !== 'object') {
        if (oldValue[0].data != newValue) oldValue[0].data = newValue; // important to use !=
        return oldValue;
      }
    }

    // fast path for pre-rendered
    if (newValue && newValue.isRendered) {
      return newValue;
    }

    // convert nodeList/HTML collection to array and string/undefined/null to text element
    const nodes = getNodesFromBindingValue<T, null>(newValue);
    newValue = makeChildrenEqual(oldValue, Array.isArray(nodes) ? nodes : [nodes]);
  } else if (binding.type === SifrrBindType.Attribute) {
    updateAttribute(<HTMLElement>node, binding.name, newValue);
  } else if (binding.type === SifrrBindType.Prop) {
    // special case for style prop
    if (binding.name === 'style') {
      newValue = newValue || emptyObj;
      const newKeys = Object.keys(newValue),
        oldKeys = Object.keys(oldValue),
        newl = newKeys.length,
        oldl = oldKeys.length;
      for (let i = 0; i < oldl; i++) {
        if (!newValue[oldKeys[i]]) {
          (<HTMLElement>node).style[oldKeys[i]] = ''; // remove if newValue doesn't have that property
        }
      }
      // add new properties
      for (let i = 0; i < newl; i++) {
        if (oldValue[newKeys[i]] !== newValue[newKeys[i]]) {
          (<HTMLElement>node).style[newKeys[i]] = `${newValue[newKeys[i]]}`;
        }
      }
    } else {
      oldValue = node[binding.name];
      node[binding.name] = newValue;
    }
    if (oldValue !== newValue && hasOnPropChange)
      (<SifrrNode<any>>node).onPropChange(binding.name, oldValue, newValue);
  }
  return newValue;
}
