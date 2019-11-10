import { Element as SifrrElement, load, Event, register } from '@sifrr/dom';
import RegexPath from './regexpath';
import { ClickEvent } from './types';

const firstTitle = window.document.title;
class SifrrRoute extends SifrrElement {
  static all: Set<SifrrRoute> = new Set();
  static currentUrl = window.location.pathname;

  static get template() {
    return '<slot></slot>';
  }

  private routeRegex: RegexPath;
  private loaded: Promise<boolean>;
  public path: string;

  onConnect() {
    this.loaded = null;
    (<typeof SifrrRoute>this.constructor).all.add(this);
  }

  onDisconnect() {
    (<typeof SifrrRoute>this.constructor).all.delete(this);
  }

  onPropsChange(props: string[]) {
    if (props.indexOf('path') > -1) {
      this.routeRegex = new RegexPath(this.path);
      this.refresh();
    }
  }

  refresh() {
    const loc = window.location.pathname;
    const parsed = this.routeRegex.testRoute(loc);
    if (parsed.match) {
      this.setState(parsed.data);
      this.activate();
      this.$$('[data-sifrr-route-state=true]', false).forEach((el: Element & { state: any }) => {
        el.state = { route: parsed.data };
      });
    } else this.deactivate();
  }

  activate() {
    this.renderIf = true;
    if (!this.loaded) {
      const sifrrElements = this.dataset.sifrrElements;
      if (sifrrElements && sifrrElements.indexOf('-') > 0) {
        try {
          const elements = JSON.parse(sifrrElements);
          this.loaded = Promise.all(Object.keys(elements).map(k => load(k, elements[k]))).then(
            () => true
          );
        } catch (e) {
          this.loaded = Promise.all(sifrrElements.split(',').map(k => load(k))).then(() => true);
        }
      } else {
        this.loaded = Promise.resolve(true);
      }
    }
    this.update();
    Event.trigger(this, 'activate');
    this.onActivate();
  }

  onActivate() {}

  deactivate() {
    this.renderIf = false;
    this.update();
    Event.trigger(this, 'deactivate');
    this.onDeactivate();
  }

  onDeactivate() {}

  static refreshAll() {
    if (window.location.pathname === this.currentUrl) return;
    this.all.forEach(sfr => sfr.refresh());
    this.currentUrl = window.location.pathname;
    this.onRouteChange();
  }

  static onRouteChange() {}

  static clickEventListener(e: ClickEvent) {
    if (!(window.history && window.history.pushState)) return false;
    if (e.metaKey || e.ctrlKey) return false;

    // find closest link element
    const composedPath = e.composedPath ? e.composedPath() : [e.target],
      l = composedPath.length;
    let target: HTMLAnchorElement;
    for (let i = 0; i < l; i++) {
      const t = <HTMLElement>composedPath[i];
      if (t.tagName && t.tagName === 'A') {
        target = <HTMLAnchorElement>t;
        break;
      }
    }

    if (
      !target ||
      target.host !== window.location.host ||
      (target.target && target.target !== '_self')
    )
      return false;

    e.preventDefault();
    // replace title with First title if there's no attribute
    const title = target.getAttribute('title') || firstTitle;
    const state = {
      pathname: target.pathname,
      href: target.href,
      title: title
    };
    window.document.title = title;
    window.history.pushState(state, title, target.href);
    SifrrRoute.refreshAll();

    return true;
  }

  static popstateEventListener(e: PopStateEvent) {
    if (e.state && e.state.title) document.title = e.state.title;
    // replace title with First title if there's no state title
    else window.document.title = firstTitle;
    SifrrRoute.refreshAll();
  }
}

Event.add('activate');
Event.add('deactivate');
register(SifrrRoute);

window.document.addEventListener('click', SifrrRoute.clickEventListener);
window.addEventListener('popstate', SifrrRoute.popstateEventListener);

export { RegexPath, SifrrRoute };
