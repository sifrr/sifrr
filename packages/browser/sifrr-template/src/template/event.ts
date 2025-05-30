const SYNTHETIC_EVENTS = new Set();

export const getEventListener = (name: string): EventListener => {
  return (e: Event) => {
    const target = <HTMLElement>(e.composedPath ? e.composedPath()[0] : e.target);
    let dom: HTMLElement | null = target;
    while (dom) {
      const eventHandler = (dom as any)[`@${name}`];
      if (typeof eventHandler === 'function') {
        eventHandler.call(window, e, target);
        return;
      }
      if (e.bubbles) {
        dom = <HTMLElement>dom.parentNode || <HTMLElement>(<ShadowRoot>(<unknown>dom)).host;
      } else {
        dom = null;
      }
    }
  };
};

const listenOpts = { capture: true, passive: true };
export const add = (name: string) => {
  name = name.toLowerCase();
  if (SYNTHETIC_EVENTS.has(name)) return false;
  const namedEL = getEventListener(name);
  document.addEventListener(name, namedEL, listenOpts);
  SYNTHETIC_EVENTS.add(name);
  return true;
};
