// import SifrrDom from '@sifrr/dom';
// const Sifrr = { Dom: SifrrDom };

const template = `<p>\${this.stores.haha.value.a}</p>`;
class SifrrStore extends Sifrr.Dom.Element {
  static get useShadowRoot() {
    return false;
  }

  static get template() {
    return template;
  }

  get stores() {
    return { haha: window.hahaStore };
  }

  onUpdate() {
    if (!this._state.class) {
      if (this.className) this.removeAttribute('class');
    } else if (this.className !== this._state.class) {
      this.className = this.state.class;
    }
  }
}
Sifrr.Dom.register(SifrrStore);
