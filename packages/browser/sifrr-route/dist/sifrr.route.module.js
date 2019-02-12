/*! Sifrr.Route v0.0.2-alpha - sifrr project | MIT licensed | https://github.com/sifrr/sifrr */
import dom from '@sifrr/dom';

class RegexPath {
  constructor(path, options = {}) {
    this.options = Object.assign({ delimiter: '/' }, options);
    this.path = path;
  }
  get regex() {
    this._regex = this._regex || new RegExp('^' + this.path
      .replace(/\/:[A-Za-z0-9_]{0,}\?/g, '(/[^/]{0,})?')
      .replace(/\*\*/g, '(.{0,})')
      .replace(/\*/g, '([^/]{0,})')
      .replace(/:[A-Za-z0-9_]{0,}/g, '([^/]{0,})') + '$');
    return this._regex;
  }
  get dataMap() {
    if (this._dataMap) return this._dataMap;
    this._dataMap = [];
    this.path.split('/').forEach((r) => {
      if (r[0] === ':') {
        this._dataMap.push(r);
      } else if (r === '*' || r === '**' || r.match(/\(.*\)/)) {
        this._dataMap.push(r);
      }
    });
    return this._dataMap;
  }
  test(route) {
    const data = {}, match = this.regex.exec(route);
    if (match) {
      this.dataMap.forEach((d, i) => {
        if (d === '*') {
          data['*'] = data['*'] || [];
          data['*'].push(match[i + 1]);
        } else if (d === '**') {
          data['**'] = data['**'] || [];
          data['**'].push(match[i + 1]);
        } else if (d[0] === ':') {
          data[d.substr(1)] = match[i + 1];
        } else {
          data.regexGroups = data.regexGroups || [];
          data.regexGroups.push(match[i + 1]);
        }
      });
    }
    return {
      match: !!match,
      data: data
    };
  }
}
var regexpath = RegexPath;

window.Sifrr = window.Sifrr || {};
window.Sifrr.Dom = window.Sifrr.Dom || dom;
const Sifrr = window.Sifrr;
Sifrr.Dom.Route =  {
  RegexPath: regexpath
};
const firstTitle = window.document.title;
class SifrrRoute extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template('<style>:host{display: none;}:host(.active){display: block;}</style><slot></slot>');
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
        el.state = { route: parsed.data };
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
    const target = e.composedPath ? e.composedPath()[0] : e.target;
    if (e.metaKey || e.ctrlKey) return false;
    if (!target.matches('a')) return false;
    if (target.host !== window.location.host) return false;
    if (target.target && target.target !== '_self') return false;
    e.preventDefault();
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
    else window.document.title = firstTitle;
    SifrrRoute.refreshAll();
  }
}
SifrrRoute.all = [];
Sifrr.Dom.Route.Element = SifrrRoute;
Sifrr.Dom.register(SifrrRoute);
window.addEventListener('popstate', SifrrRoute.popstateEventListener);
window.document.addEventListener('click', SifrrRoute.clickEventListener);
var sifrr_route = SifrrRoute;

export default sifrr_route;
/*! (c) @aadityataparia */
//# sourceMappingURL=sifrr.route.module.js.map
