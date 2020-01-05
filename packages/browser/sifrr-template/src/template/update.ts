import { makeChildrenEqual } from './makeequal';
import updateAttribute from './updateattribute';
import { TEXT_NODE } from './constants';
import { SifrrBindType, SifrrNode, SifrrProps, SifrrBindMap } from './types';
import getNodesFromBindingValue from './getnodes';

const emptyObj = {};

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
    const { node, bindMap, currentValues } = refs[i];
    const hasOnPropChange = !!(<SifrrNode<any>>node).onPropChange;

    for (let j = bindMap.length - 1; j > -1; --j) {
      const binding = bindMap[j];

      // special direct props (events)
      if (binding.type === SifrrBindType.Prop && binding.direct) {
        if (node[binding.name] !== binding.value) node[binding.name] = binding.value;
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
  }
}

function updateOne<T>(
  node: Node,
  binding: SifrrBindMap<T>,
  oldValue: any,
  newValue: any,
  hasOnPropChange: boolean
) {
  if (oldValue === newValue) return oldValue;

  // text
  if (binding.type === SifrrBindType.Text) {
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
    node[binding.name] = newValue;

    // special case for style prop
    if (binding.name === 'style') {
      newValue = newValue || emptyObj;
      const newKeys = Object.keys(newValue),
        oldKeys = Object.keys(oldValue),
        newl = newKeys.length,
        oldl = oldKeys.length;
      // add new properties
      for (let i = 0; i < newl; i++) {
        if (oldValue[newKeys[i]] !== newValue[newKeys[i]]) {
          (<HTMLElement>node).style[newKeys[i]] = newValue[newKeys[i]] || ''; // remove undefined with empty string
        }
      }
      for (let i = 0; i < oldl; i++) {
        if (!newValue[oldKeys[i]]) (<HTMLElement>node).style[oldKeys[i]] = ''; // remove if newValue doesn't have that property
      }
    }
    hasOnPropChange && (<SifrrNode<any>>node).onPropChange(binding.name, oldValue, newValue);
  }
  return newValue;
}
