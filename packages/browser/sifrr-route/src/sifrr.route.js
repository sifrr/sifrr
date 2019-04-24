const SifrrDom = require('@sifrr/dom');

const Route =  {
  RegexPath: require('./regexpath')
};

const firstTitle = window.document.title;
class SifrrRoute extends SifrrDom.Element {
  static get template() {
    return SifrrDom.template('<style>:host{display: none;}:host(.active){display: block;}</style><slot></slot>');
  }

  static observedAttrs() {
    return ['path'];
  }

  onConnect() {
    this.loaded = false;
    this.constructor.all.add(this);
  }

  onDisconnect() {
    this.constructor.all.delete(this);
  }

  onAttributeChange(attrName) {
    if (attrName === 'path') {
      this._routeRegex = new Route.RegexPath(this.getAttribute('path'));
      this.refresh();
    }
  }

  get routeRegex() {
    return this._routeRegex;
  }

  refresh() {
    const location = window.location.pathname;
    const parsed = this.routeRegex.test(location);
    if (parsed.match) {
      this.activate();
      this.state = parsed.data;
      this.$$('[data-sifrr-route-state=true]', false).forEach((el) => {
        el.state = { route: parsed.data };
      });
    } else this.deactivate();
  }

  activate() {
    if (!this.loaded) {
      this.loaded = true;
      if (this.dataset.sifrrElements && this.dataset.sifrrElements.indexOf('-') > 0) {
        this.dataset.sifrrElements.split(',').forEach((tag) => {
          SifrrDom.load(tag);
        });
      }
    }
    this.classList.add('active');
    SifrrDom.Event.trigger(this, 'activate');
    this.onActivation();
  }

  onActivation() {}

  deactivate() {
    this.classList.remove('active');
    SifrrDom.Event.trigger(this, 'deactivate');
    this.onDeactivation();
  }

  onDeactivation() {}

  static get currentUrl() {
    return this._curl;
  }

  static set currentUrl(v) {
    this._curl = v;
  }

  static refreshAll() {
    if (window.location.pathname === this.currentUrl) return;
    this.all.forEach((sfr) => {
      sfr.refresh();
    });
    this.onRouteChange();
    this.currentUrl = window.location.pathname;
  }

  static onRouteChange() {}

  static clickEventListener(e) {
    if (!(window.history && window.history.pushState)) return false;
    const target = e.composedPath ? e.composedPath()[0] : e.target; // composedPath works in safari too
    if (e.metaKey ||
      e.ctrlKey ||
      !target.matches('a') ||
      target.host !== window.location.host ||
      (target.target && target.target !== '_self')) return false;

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

  static popstateEventListener(e) {
    if (e.state && e.state.title) window.document.title = e.state.title;
    // replace title with First title if there's no state title
    else window.document.title = firstTitle;
    SifrrRoute.refreshAll();
  }
}

SifrrRoute.all = new Set();

SifrrDom.Event.add('activate');
SifrrDom.Event.add('deactivate');
Route.Element = SifrrRoute;
SifrrDom.register(SifrrRoute);

window.addEventListener('popstate', SifrrRoute.popstateEventListener);
window.document.addEventListener('click', SifrrRoute.clickEventListener);

module.exports = Route;
