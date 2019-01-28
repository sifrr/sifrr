// Taken from https://github.com/Freak6133/stage0/blob/master/syntheticEvents.js
const SYNTHETIC_EVENTS = {};

const nativeToSyntheticEvent = (e, name) => {
  return Promise.resolve((() => {
    const target = e.composedPath ? e.composedPath()[0] : e.target;
    let dom = target;
    while(dom) {
      const eventHandler = dom[`$${name}`];
      if (eventHandler) {
        eventHandler(e, target);
      }
      cssMatchEvent(e, name, dom, target);
      dom = dom.parentNode || dom.host;
    }
  })());
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
  add: (name) => {
    if (SYNTHETIC_EVENTS[name]) return false;
    window.addEventListener(name, event => nativeToSyntheticEvent(event, name), { capture: true, passive: true });
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
    el.dispatchEvent(new window.Event(name, Object.assign({ bubbles: true, composed: true }, options)));
  }
};

module.exports = Event;
