const template = Sifrr.Dom.html`<style>
  :host {
    display: none;
  }
  :host(.active) {
    display: block;
    opacity: 0;
    animation: slide 0.3s ease forwards;
  }
  @keyframes slide {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
<slot></slot>`;

const RegexPath = require('./regexpath');

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
    this._routeRegex = this._routeRegex || new RegexPath(this.dataset.sifrrPath);
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

  static refreshAll() {
    SifrrRoutes.forEach((sfr) => {
      sfr.refresh();
    });
    this.onRouteChange();
  }

  static onRouteChange() {}
}

Sifrr.Dom.register(SifrrRoute);

document.addEventListener('click', (e) => {
  const target = e.path ? e.path[0] : e.target;
  if (!target.matches('a') || target.host !== window.location.host || (target.target && target.target !== '_self')) return;
  e.preventDefault();
  const title = target.getAttribute('title') || 'Title';
  const state = {
    location: target.pathname,
    title: title
  };
  // replace title with default title for your webapp, maybe your app name
  document.title = title;
  history.pushState(state, title, target.pathname);
  SifrrRoute.refreshAll();
});

window.addEventListener('popstate', (event) => {
  if (event.state && event.state.title) document.title = event.state.title;
  SifrrRoute.refreshAll();
});
