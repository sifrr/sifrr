const Sifrr = window.Sifrr || /* istanbul ignore next */ {};
Sifrr.Dom = Sifrr.Dom || /* istanbul ignore next */ require('@sifrr/dom');

Sifrr.Dom.Route =  {
  RegexPath: require('./regexpath')
};

const firstTitle = window.document.title;
class SifrrRoute extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.html('<style>:host{display: none;}:host(.active){display: block;}</style><slot></slot>');
  }

  static observedAttrs() {
    return ['path'];
  }

  onConnect() {
    this.loaded = false;
    this.constructor.all.push(this);
  }

  onDisconnect() {
    this.constructor.all.splice(this.constructor.all.indexOf(this), 1);
  }

  onAttributeChange(attrName) {
    if (attrName === 'path') {
      this._routeRegex = new Sifrr.Dom.Route.RegexPath(this.getAttribute('path'));
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
        el.dataset.sifrrState = JSON.stringify({ route: parsed.data });
      });
    } else this.deactivate();
  }

  activate() {
    if (!this.loaded) {
      this.loaded = true;
      if (this.dataset.sifrrElements && this.dataset.sifrrElements.indexOf('-') > 0) {
        const tags = this.dataset.sifrrElements.split(',');
        tags
          .filter((value, index, self) => self.indexOf(value) === index)
          .forEach((tag) => {
            Sifrr.Dom.load(tag);
          });
      }
    }
    this.classList.add('active');
  }

  deactivate() {
    this.classList.remove('active');
  }

  static get currentUrl() {
    return this._curl;
  }

  static set currentUrl(v) {
    this._curl = v;
  }

  static refreshAll() {
    if (window.location.href === this.currentUrl) return;
    this.all.forEach((sfr) => {
      sfr.refresh();
    });
    this.onRouteChange();
    this.currentUrl = window.location.href;
  }

  static onRouteChange() {}

  static clickEventListener(e) {
    if (!(window.history && window.history.pushState)) return false;
    const target = e.composedPath ? e.composedPath()[0] : e.target; // composedPath works in safari too
    if (e.metaKey || e.ctrlKey) return false;
    if (!target.matches('a')) return false;
    if (target.host !== window.location.host) return false;
    if (target.target && target.target !== '_self') return false;

    e.preventDefault();
    // replace title with First title if there's no attribute
    const title = target.getAttribute('title') || firstTitle;
    const state = {
      location: target.pathname,
      title: title
    };
    window.document.title = title;
    window.history.pushState(state, title, target.pathname);
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
SifrrRoute.all = [];

Sifrr.Dom.Route.Element = SifrrRoute;
Sifrr.Dom.register(SifrrRoute);

window.addEventListener('popstate', SifrrRoute.popstateEventListener);
window.document.addEventListener('click', SifrrRoute.clickEventListener);

module.exports = SifrrRoute;
