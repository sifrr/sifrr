// Taken from https://github.com/Freak6133/stage0/blob/master/syntheticEvents.js
const nativeToSyntheticEvent = (event, name) => {
  let dom = event.target;
  while(dom !== null) {
    const eventHandler = dom[`$${name}`];
    if (eventHandler) {
      eventHandler(event, name);
    }
    dom = dom.parentNode;
  }
};
const SYNTHETIC_EVENTS = {};
module.exports = (name) => {
  if (SYNTHETIC_EVENTS[name]) return;
  window.document.addEventListener(name, event => nativeToSyntheticEvent(event, name), { capture: true, passive: true });
  SYNTHETIC_EVENTS[name] = true;
};
