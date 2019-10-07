import { makeChildrenEqual } from './makeequal';
import { makeChildrenEqualKeyed } from './keyed';
import updateAttribute from './updateattribute';
import { evaluateBindings } from './bindings';
import { TEMPLATE, RENDER_IF_PROP, ELEMENT_NODE } from './constants';
import shouldMerge from '../utils/shouldmerge';

const displayNone = 'none';

const renderIf = (dom, shouldRender = dom[RENDER_IF_PROP] != false) => {
  if (dom.___oldRenderIf === shouldRender) return shouldRender;

  dom.___oldRenderIf = shouldRender;
  if (shouldRender) {
    dom.style.display = dom.__sifrrOldDisplay;
    return true;
  } else {
    dom.__sifrrOldDisplay = dom.style.display;
    dom.style.display = displayNone;
    return false;
  }
};

export default function update(element, stateMap) {
  if (element.nodeType === ELEMENT_NODE && !renderIf(element)) return;

  stateMap = stateMap || element.constructor.stateMap;
  // Update nodes
  for (let i = element._refs ? element._refs.length - 1 : -1; i > -1; --i) {
    const data = stateMap[i].ref,
      dom = element._refs[i];

    // Fast path for text nodes
    if (data.type === 0) {
      // state node
      if (dom.__data != element.state[data.text]) dom.data = dom.__data = element.state[data.text];
      continue;
    } else if (data.type === 1) {
      // text node
      const newValue = evaluateBindings(data.text, element);
      if (dom.data != newValue) dom.data = newValue;
      continue;
    }

    // events
    if (!dom._sifrrEventSet) {
      if (data.events) {
        for (let i = data.events.length - 1; i > -1; --i) {
          const ev = data.events[i];
          dom[ev[0]] = evaluateBindings(ev[1], element);
        }
        dom._root = element;
      }
      dom._sifrrEventSet = true;
    }

    // state
    if (data.state) {
      const newState = evaluateBindings(data.state, element);
      if (dom.setState && shouldMerge(dom.state, newState)) dom.setState(newState);
      else dom['state'] = newState;
    }

    // props
    if (data.props) {
      const dirty = dom.onPropsChange ? [] : false;
      for (let i = data.props.length - 1; i > -1; --i) {
        const newValue = evaluateBindings(data.props[i][1], element);
        if (data.props[i][0] === 'style') {
          const keys = Object.keys(newValue),
            l = keys.length;
          for (let i = 0; i < l; i++) {
            if (dom.style[keys[i]] !== newValue[keys[i]]) dom.style[keys[i]] = newValue[keys[i]];
          }
        } else if (newValue !== dom[data.props[i][0]]) {
          dom[data.props[i][0]] = newValue;
          dirty && dirty.push(data.props[i][0]);

          // render if
          if (data.props[i][0] === RENDER_IF_PROP) {
            if (renderIf(dom)) typeof dom.update === 'function' && dom.update();
          }
        }
      }
      dirty && dirty.length > 0 && dom.onPropsChange(dirty);
    }

    // update attributes
    if (data.attributes) {
      for (let i = data.attributes.length - 1; i > -1; --i) {
        const attr = data.attributes[i];
        let newValue;
        if (attr[1] === 0) newValue = element.state[attr[2]];
        else newValue = evaluateBindings(attr[2], element);
        updateAttribute(dom, attr[0], newValue);
      }
    }

    // repeaing node
    if (data.type === 3) {
      if (!dom.sifrrRepeat || dom.sifrrRepeat.length === 0) dom.textContent = '';
      else if (dom.sifrrKey) {
        makeChildrenEqualKeyed(
          dom,
          dom.sifrrRepeat,
          data.se.sifrrClone.bind(data.se),
          dom.sifrrKey
        );
      } else makeChildrenEqual(dom, dom.sifrrRepeat, data.se.sifrrClone.bind(data.se));
      continue;
    }

    if (data.text === undefined) continue;

    // update element
    let newValue;
    if (typeof data.text === 'string') newValue = element.state[data.text];
    else newValue = evaluateBindings(data.text, element);

    if (!newValue || newValue.length === 0) dom.textContent = '';
    else {
      // html node
      const newValue = evaluateBindings(data.text, element);
      let children,
        isNode = false;
      if (Array.isArray(newValue)) {
        children = newValue;
      } else if (newValue.content && newValue.content.nodeType === 11) {
        children = newValue.content.childNodes;
        isNode = true;
      } else if (newValue.nodeType) {
        children = [newValue];
      } else if (typeof newValue === 'string') {
        const temp = TEMPLATE();
        temp.innerHTML = newValue.toString();
        children = temp.content.childNodes;
        isNode = true;
      } else {
        children = Array.prototype.slice.call(newValue);
      }
      makeChildrenEqual(dom, children, undefined, isNode);
    }
  }
}
