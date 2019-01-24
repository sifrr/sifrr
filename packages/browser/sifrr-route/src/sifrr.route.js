const template = Sifrr.Dom.html`<style>
  :host {
    display: none;
  }
  :host(.active) {
    display: block;
  }
</style>
<slot></slot>`;

Sifrr.Dom.Route =  {
  RegexPath: require('./regexpath')
};

Sifrr.Dom.Event.add('click');
const SifrrRoutes = [];
class SifrrRoute extends Sifrr.Dom.Element {
  static get template() {
    return template;
  }

  static observedAttrs() {
    return ['data-sifrr-path'];
  }

  onConnect() {
    this.loaded = false;
    SifrrRoutes.push(this);
  }

  onDisconnect() {
    SifrrRoutes.splice(SifrrRoutes.indexOf(this), 1);
  }

  onAttributeChange(attrName) {
    if (attrName == 'data-sifrr-path') {
      this.refresh();
    }
  }

  get routeRegex() {
    this._routeRegex = this._routeRegex || new Sifrr.Dom.Route.RegexPath(this.dataset.sifrrPath);
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
    SifrrRoutes.forEach((sfr) => {
      sfr.refresh();
    });
    this.onRouteChange();
    this.currentUrl = window.location.href;
  }

  static onRouteChange() {}
}

Sifrr.Dom.Route.Element = SifrrRoute;
Sifrr.Dom.register(SifrrRoute);

document.addEventListener('click', (e) => {
  if (!(window.history && window.history.pushState)) return;
  const target = e.composedPath ? e.composedPath()[0] : e.target;
  if (e.metaKey || e.ctrlKey) return;
  if (!target.matches('a') || target.host !== window.location.host || (target.target && target.target !== '_self')) return;
  e.preventDefault();
  const title = target.getAttribute('title') || 'Title';
  const state = {
    location: target.pathname,
    title: title
  };
  // replace title with default title for your webapp, maybe your app name
  document.title = title;
  window.history.pushState(state, title, target.pathname);
  SifrrRoute.refreshAll();
});

window.addEventListener('popstate', (event) => {
  if (event.state && event.state.title) document.title = event.state.title;
  SifrrRoute.refreshAll();
});
