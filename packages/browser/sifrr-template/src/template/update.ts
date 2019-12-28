import { makeChildrenEqual } from './makeequal';
import updateAttribute from './updateattribute';
import { RENDER_IF_PROP, ELEMENT_NODE } from './constants';
import { DomBindingReturnValue, SifrrBindType } from './types';
import { arrayOf } from '../utils';

const displayNone = 'none';
const emptyArray = [];

const renderIf = (dom: HTMLElement, shouldRender = dom[RENDER_IF_PROP] != false) => {
  if (dom.nodeType !== ELEMENT_NODE) return true;
  if (dom.__oldRenderIf === shouldRender) return shouldRender;

  dom.__oldRenderIf = shouldRender;
  if (shouldRender) {
    dom.style.display = dom.__sifrrOldDisplay;
    return true;
  } else {
    dom.__sifrrOldDisplay = dom.style.display;
    dom.style.display = displayNone;
    return false;
  }
};

function getNodesFromBindingValue(value: DomBindingReturnValue): (Node | ChildNode)[] {
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

export default function update(tempElement: HTMLTemplateElement) {
  const element = tempElement.parent;
  if (!element) return;
  if (!renderIf(<HTMLElement>element)) {
    return;
  }

  // Update nodes
  for (let i = tempElement.refs ? tempElement.refs.length - 1 : -1; i > -1; --i) {
    const { node, bindMap, currentValues } = tempElement.refs[i];

    for (let j = bindMap.length - 1; j > -1; --j) {
      const binding = bindMap[j];
      const oldValue = currentValues[j];

      // special direct props (events)
      if (binding.type === SifrrBindType.Prop && binding.direct) {
        node[binding.name] = binding.value;
        continue;
      }

      let newValue = binding.value.call(null, element, oldValue);
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
          newValue = [<Node>document.createTextNode('')];
        }
        makeChildrenEqual(<ChildNode[]>oldValue, newValue, undefined);
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
              oldValue[newKeys[i]] = newValue[newKeys[i]];
            }
          }
          for (let i = 0; i < oldl; i++) {
            if (oldValue[oldKeys[i]] !== newValue[oldKeys[i]])
              (<HTMLElement>node).style[oldKeys[i]] = newValue[oldKeys[i]] || '';
          }
        }
      }
      tempElement.refs[i].currentValues[j] = newValue;
    }

    if (!renderIf(<HTMLElement>node)) {
      continue;
    }
    if (node.__sifrrTemplate) update(node.__sifrrTemplate);
  }
}
