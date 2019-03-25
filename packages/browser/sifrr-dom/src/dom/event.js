// Inspired from https://github.com/Freak6133/stage0/blob/master/syntheticEvents.js
const SYNTHETIC_EVENTS = {};
const opts = { capture: true, passive: true };

const getEventListener = (name) => {
  return (e) => {
    const target = e.composedPath ? e.composedPath()[0] : e.target;
    let dom = target;
    while(dom) {
      const eventHandler = dom[`_${name}`] || (dom.hasAttribute ? dom.getAttribute(`_${name}`) : null);
      if (typeof eventHandler === 'function') {
        eventHandler.call(dom._root || window, e, target);
      } else if (typeof eventHandler === 'string') {
        new Function('event', 'target', eventHandler).call(dom._root || window, event, target);
      }
      cssMatchEvent(e, name, dom, target);
      dom = dom.parentNode || dom.host;
    }
  };
};

const cssMatchEvent = (e, name, dom, target) => {
  function callEach(fxns) {
    fxns.forEach((fxn) => fxn(e, target, dom));
  }
  for (let css in SYNTHETIC_EVENTS[name]) {
    if ((typeof dom.matches === 'function' && dom.matches(css)) ||
    (dom.nodeType === 9 && css === 'document')) callEach(SYNTHETIC_EVENTS[name][css]);
  }
};

const Event = {
  all: SYNTHETIC_EVENTS,
  add: (name) => {
    if (SYNTHETIC_EVENTS[name]) return false;
    const namedEL = getEventListener(name);
    window.addEventListener(name, namedEL, opts);
    SYNTHETIC_EVENTS[name] = {};
    return true;
  },
  addListener: (name, css, fxn) => {
    const fxns = SYNTHETIC_EVENTS[name][css] || [];
    if (fxns.indexOf(fxn) < 0) fxns.push(fxn);
    SYNTHETIC_EVENTS[name][css] = fxns;
    return true;
  },
  removeListener: (name, css, fxn) => {
    const fxns = SYNTHETIC_EVENTS[name][css] || [], i = fxns.indexOf(fxn);
    if (i >= 0) fxns.splice(i, 1);
    SYNTHETIC_EVENTS[name][css] = fxns;
    return true;
  },
  trigger: (el, name, options) => {
    if (typeof el === 'string') el = document.querySelector(el);
    const ce = new CustomEvent(name, Object.assign({ bubbles: true, composed: true }, options));
    el.dispatchEvent(ce);
  },
  opts,
  getEventListener
};

module.exports = Event;
