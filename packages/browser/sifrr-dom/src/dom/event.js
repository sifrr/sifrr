// Taken from https://github.com/Freak6133/stage0/blob/master/syntheticEvents.js
const nativeToSyntheticEvent = (e, name) => {
  let dom = e.path ? e.path[0] : e.target;
  while(dom) {
    const eventHandler = dom[`$${name}`];
    if (eventHandler) {
      eventHandler(event, name);
    }
    dom = dom.parentNode || dom.host;
  }
};
const SYNTHETIC_EVENTS = {};
module.exports = (name) => {
  if (SYNTHETIC_EVENTS[name]) return false;
  window.document.addEventListener(name, event => nativeToSyntheticEvent(event, name), { capture: true, passive: true });
  SYNTHETIC_EVENTS[name] = true;
  return true;
};
