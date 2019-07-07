// Inspired from https://github.com/Freak6133/stage0/blob/master/syntheticEvents.js
const SYNTHETIC_EVENTS = {};
const listenOpts = { capture: true, passive: true };
const customOpts = { composed: true, bubbles: true };

const getEventListener = name => {
  return e => {
    const target = e.composedPath ? e.composedPath()[0] : e.target;
    let dom = target;
    while (dom) {
      const eventHandler =
        dom[`_${name}`] || (dom.hasAttribute ? dom.getAttribute(`_${name}`) : null);
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
  function callEach(fxns, isElement) {
    fxns.forEach(fxn => {
      if (!isElement || fxn.__dom === dom) fxn(e, target, dom);
    });
  }
  for (let css in SYNTHETIC_EVENTS[name]) {
    if (
      (typeof dom.matches === 'function' && dom.matches(css)) ||
      (dom.nodeType === 9 && css === 'document') ||
      css === 'element'
    )
      callEach(SYNTHETIC_EVENTS[name][css], css === 'element');
  }
};

const Event = {
  all: SYNTHETIC_EVENTS,
  add: name => {
    if (SYNTHETIC_EVENTS[name]) return false;
    const namedEL = getEventListener(name);
    document.addEventListener(name, namedEL, listenOpts);
    SYNTHETIC_EVENTS[name] = {};
    return true;
  },
  addListener: (name, css, fxn) => {
    if (!SYNTHETIC_EVENTS[name])
      throw Error(`You need to call Sifrr.Dom.Event.add('${name}') before using listeners.`);
    if (typeof css !== 'string') {
      fxn.__dom = css;
      css = 'element';
    }
    SYNTHETIC_EVENTS[name][css] = SYNTHETIC_EVENTS[name][css] || new Set();
    SYNTHETIC_EVENTS[name][css].add(fxn);
    return true;
  },
  removeListener: (name, css, fxn) => {
    if (SYNTHETIC_EVENTS[name][css]) SYNTHETIC_EVENTS[name][css].delete(fxn);
    return true;
  },
  trigger: (el, name, options) => {
    if (typeof el === 'string') el = document.$(el);
    el.dispatchEvent(new CustomEvent(name, Object.assign(customOpts, options)));
  },
  getEventListener
};

module.exports = Event;
