import { makeChildrenEqual } from './makeequal';
import updateAttribute from './updateattribute';
import { RENDER_IF_PROP, ELEMENT_NODE } from './constants';
import { DomBindingReturnValue, SifrrBindType, SifrrNode, SifrrProps, SifrrNodes } from './types';
import { arrayOf, isSifrrNode } from './utils';

const displayNone = 'none';
const emptyArray = [];

function renderIf<T>(dom: SifrrProps<T>, shouldRender = dom[RENDER_IF_PROP] != false) {
  if (dom.nodeType !== ELEMENT_NODE) return true;

  const domEl = <HTMLElement>(<unknown>dom);
  if (domEl.__oldRenderIf === shouldRender) return shouldRender;

  domEl.__oldRenderIf = shouldRender;
  if (shouldRender) {
    domEl.style.display = domEl.__sifrrOldDisplay;
    return true;
  } else {
    domEl.__sifrrOldDisplay = domEl.style.display;
    domEl.style.display = displayNone;
    return false;
  }
}

function getNodesFromBindingValue(value: DomBindingReturnValue): Node[] {
  if (value === null || value === undefined) {
    return emptyArray;
  } else if (Array.isArray(value)) {
    const ret = [];
    for (let i = 0; i < value.length; i++) {
      Array.prototype.push.apply(ret, getNodesFromBindingValue(value[i]));
    }
    return ret;
  } else if (value instanceof HTMLTemplateElement) {
    return arrayOf(value.content.childNodes);
  } else if (value instanceof Node) {
    return [value];
  } else if (value instanceof NodeList) {
    return arrayOf(value);
  } else {
    return [document.createTextNode(value.toString())];
  }
}

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
  if (!renderIf<T>(props)) {
    return;
  }

  // Update nodes
  for (let i = refs ? refs.length - 1 : -1; i > -1; --i) {
    const { node, bindMap, currentValues } = refs[i];

    for (let j = bindMap.length - 1; j > -1; --j) {
      const binding = bindMap[j];
      const oldValue = currentValues[j];

      // special direct props (events)
      if (
        binding.type === SifrrBindType.Prop &&
        binding.direct &&
        node[binding.name] != binding.value
      ) {
        node[binding.name] = binding.value;
        continue;
      }

      let newValue = binding.value(props, oldValue);
      if (oldValue === newValue) continue;

      // text
      if (binding.type === SifrrBindType.Text) {
        // fast path for one text node
        if (oldValue instanceof Text) {
          if (newValue instanceof Text) {
            oldValue.data = newValue.data;
            continue;
          } else if (typeof newValue === 'string') {
            oldValue.data = newValue;
            continue;
          }
        }

        // convert nodeList/HTML collection to array and string to text element
        newValue = getNodesFromBindingValue(newValue);

        // special case of no value return
        if (newValue.length < 1) {
          newValue = [<Node>document.createElement('tr')];
        }
        newValue = makeChildrenEqual(<ChildNode[]>oldValue, newValue);
      } else if (binding.type === SifrrBindType.Attribute) {
        updateAttribute(<HTMLElement>node, binding.name, newValue);
      } else if (binding.type === SifrrBindType.Prop) {
        node[binding.name] = newValue;

        // special case for style prop
        if (binding.name === 'style') {
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
      }
      refs[i].currentValues[j] = newValue;
    }

    if (!renderIf(<HTMLElement>node)) {
      continue;
    }
    if (node !== tempElement && isSifrrNode(node)) {
      update(node, props);
    }
  }
}
