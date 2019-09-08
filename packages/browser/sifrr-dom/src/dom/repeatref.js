import simpleElement from './simpleelement';
import { getStringBindingFxn } from './bindings';
import { REPEAT_ATTR } from './constants';

export default (sm, el) => {
  sm.type = 3;
  sm.se = simpleElement(el.childNodes, el.sifrrDefaultState);
  sm.text = getStringBindingFxn(el.getAttribute(REPEAT_ATTR));
  el.removeAttribute(REPEAT_ATTR);
};
