import {
  TEXT_NODE,
  COMMENT_NODE,
  ELEMENT_NODE,
  REF_REG,
  REF_REG_EXACT,
  REF_LENGTH
} from './constants';
import updateAttribute from './updateattribute';

import {
  SifrrBindType,
  SifrrBindMap,
  EventMap,
  PropMap,
  AttributeMap,
  SifrrFunctionMap
} from './types';

function attrToProp(attrName: string) {
  return attrName.substr(1).replace(/-([a-z])/g, g => g[1].toUpperCase());
}

export default function creator(el: HTMLElement, functionMap: SifrrFunctionMap): SifrrBindMap | 0 {
  if (el.nodeType === TEXT_NODE || el.nodeType === COMMENT_NODE) {
    const textEl = <Text>(<unknown>el);
    const x = textEl.data;
    const exactMatch = x.match(REF_REG_EXACT);
    if (exactMatch) {
      textEl.data = '';

      return {
        type: SifrrBindType.Text,
        text: functionMap.get(exactMatch[1])
      };
    }

    const middleMatch = x.match(REF_REG);
    if (middleMatch) {
      if (middleMatch.index === 0) {
        textEl.splitText(REF_LENGTH);
        textEl.data = '';

        return {
          type: SifrrBindType.Text,
          text: functionMap.get(middleMatch[1])
        };
      } else {
        textEl.splitText(middleMatch.index);
      }
    }

    return 0;
  }

  // if (el.nodeType === ELEMENT_NODE) {
  //   const sm: any = {};
  //   // Html ?
  //   if (el.hasAttribute(HTML_ATTR)) {
  //     const innerHTML = el.innerHTML;
  //     if (innerHTML.indexOf('${') > -1) {
  //       sm.type = 2;
  //       sm.text = getBindingFxns(innerHTML.replace(/<!--((?:(?!-->).)+)-->/g, '$1').trim());
  //     }
  //     el.textContent = '';
  //   } else if (el.hasAttribute(REPEAT_ATTR)) {
  //     sm.type = 3;
  //     sm.se = simpleElement(el.childNodes);
  //   }
  //   // attributes
  //   const attrs = Array.prototype.slice.call(el.attributes),
  //     l = attrs.length;
  //   const attrStateMap: AttributeMap = [];
  //   const eventMap: EventMap = [];
  //   const propMap: PropMap = [];
  //   for (let i = 0; i < l; i++) {
  //     const attribute = attrs[i];

  //     if (attribute.name[0] === ':') {
  //       // string prop
  //       if (attribute.value.indexOf('${') < 0) {
  //         propMap.push([attrToProp(attribute.name), [attribute.value]]);
  //       } else if (attribute.name === ':state') {
  //         // binding prop
  //         sm['state'] = getBindingFxns(attribute.value);
  //       } else {
  //         // Array contents -> 0: property name, 1: binding
  //         propMap.push([attrToProp(attribute.name), getBindingFxns(attribute.value)]);
  //       }
  //       el.setAttribute(attribute.name, '');
  //     }

  //     if (attribute.value.indexOf('${') < 0) continue;

  //     if (attribute.name[0] === '_') {
  //       // state binding
  //       eventMap.push([attribute.name, getBindingFxns(attribute.value)]);
  //     } else if (attribute.name[0] !== ':') {
  //       const binding = getStringBindingFxn(attribute.value);
  //       // Array contents -> 0: name, 1: type, 2: binding
  //       if (typeof binding !== 'string') {
  //         // text attr
  //         attrStateMap.push([attribute.name, 1, binding]);
  //       } else {
  //         // state attr
  //         attrStateMap.push([attribute.name, 0, binding]);
  //         if (defaultState) updateAttribute(el, attribute.name, defaultState[binding]);
  //       }
  //     }
  //   }
  //   if (eventMap.length > 0) sm.events = eventMap;
  //   if (propMap.length > 0) sm.props = propMap;
  //   if (attrStateMap.length > 0) sm.attributes = attrStateMap;

  //   if (Object.keys(sm).length > 0) return <SifrrStateMap>sm;
  // }
  return 0;
}
