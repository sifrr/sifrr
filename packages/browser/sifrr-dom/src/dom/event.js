// Taken from https://github.com/Freak613/stage0/blob/master/syntheticEvents.js
const nativeToSyntheticEvent = (event, name) => {
  let dom = event.target;
  while(dom !== null) {
    const eventHandler = dom[`$${name}`];
    if (eventHandler) {
      eventHandler();
      return;
    }
    dom = dom.parentNode;
  }
};
const SYNTHETIC_EVENTS = {};
module.exports = (name) => {
  if (SYNTHETIC_EVENTS[name]) return;
  document.addEventListener(name, event => nativeToSyntheticEvent(event, name));
  SYNTHETIC_EVENTS[name] = true;
};
