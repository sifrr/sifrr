import { TEXT_NODE, COMMENT_NODE, ELEMENT_NODE, HTML_ATTR, REPEAT_ATTR } from './constants';
import repeatref from './repeatref';
// ref types:
// 0: state
// 1: text
// 2: html
// 3: arrayToDom
import { getBindingFxns, getStringBindingFxn } from './bindings';
import updateAttribute from './updateattribute';

export default function creator(el, defaultState) {
  if (el.nodeType === TEXT_NODE || el.nodeType === COMMENT_NODE) {
    const x = el.data;
    if (x.indexOf('${') > -1) {
      const binding = getStringBindingFxn(x.trim());
      if (typeof binding !== 'string') {
        // text node
        return {
          type: 1,
          text: binding
        };
      } else {
        if (defaultState) el.data = el.__data = defaultState[binding];
        // state node
        return {
          type: 0,
          text: binding
        };
      }
    }
  } else if (el.nodeType === ELEMENT_NODE) {
    const sm = {};
    // Html ?
    if (el.hasAttribute(HTML_ATTR)) {
      const innerHTML = el.innerHTML;
      if (innerHTML.indexOf('${') > -1) {
        sm.type = 2;
        sm.text = getBindingFxns(innerHTML.replace(/<!--((?:(?!-->).)+)-->/g, '$1').trim());
      }
      el.textContent = '';
    } else if (el.hasAttribute(REPEAT_ATTR)) {
      repeatref(sm, el);
    }
    // attributes
    const attrs = el.attributes,
      l = attrs.length;
    const attrStateMap = [];
    const eventMap = [];
    const propMap = [];
    for (let i = 0; i < l; i++) {
      const attribute = attrs[i];
      if (attribute.value.indexOf('${') < 0) continue;
      if (attribute.name[0] === '_') {
        // state binding
        eventMap.push([attribute.name, getBindingFxns(attribute.value)]);
      } else if (attribute.name[0] === ':' && attribute.name[0] !== ':key') {
        if (attribute.name.substr(1) === 'state') {
          sm['state'] = getBindingFxns(attribute.value);
        } else {
          // Array contents -> 0: property name, 1: binding
          propMap.push([attribute.name.substr(1), getBindingFxns(attribute.value)]);
        }
        el.removeAttribute(attribute.name);
      } else {
        // Don't treat style differently because same performance https://jsperf.com/style-property-vs-style-attribute/2
        const binding = getStringBindingFxn(attribute.value);
        // Array contents -> 0: name, 1: type, 2: binding
        if (typeof binding !== 'string') {
          // text attr
          attrStateMap.push([attribute.name, 1, binding]);
        } else {
          // state attr
          attrStateMap.push([attribute.name, 0, binding]);
          if (defaultState) updateAttribute(el, attribute.name, defaultState[binding]);
        }
      }
    }
    if (eventMap.length > 0) sm.events = eventMap;
    if (propMap.length > 0) sm.props = propMap;
    if (attrStateMap.length > 0) sm.attributes = attrStateMap;

    if (Object.keys(sm).length > 0) return sm;
  }
  return 0;
}
