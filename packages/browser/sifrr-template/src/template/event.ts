const SYNTHETIC_EVENTS = new Set();

export const getEventListener = (name: string): EventListener => {
  return (e: Event) => {
    const target = <HTMLElement>(e.composedPath?.()[0] ?? e.target);
    let dom: HTMLElement | null = target;
    while (dom) {
      const eventHandler = (dom as any)[`@${name}`];
      if (typeof eventHandler === 'function') {
        eventHandler.call(dom, e, dom);
      }
      if (e.bubbles && !e.isPropagationStopped && !e.isImmediatePropagationStopped) {
        dom = dom.parentElement ?? ((dom as unknown as ShadowRoot).host as HTMLElement);
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

declare global {
  interface Event {
    isPropagationStopped?: boolean;
    isImmediatePropagationStopped?: boolean;
  }
}

const _stopPropogation = Event.prototype.stopPropagation;
Event.prototype.stopPropagation = function (...args): void {
  this.isPropagationStopped = true;
  _stopPropogation.apply(this, ...args);
};

const _stopImmediatePropagation = Event.prototype.stopImmediatePropagation;
Event.prototype.stopImmediatePropagation = function (...args): void {
  this.isImmediatePropagationStopped = true;
  _stopImmediatePropagation.apply(this, ...args);
};
