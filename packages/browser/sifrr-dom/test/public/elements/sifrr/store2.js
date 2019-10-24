// import SifrrDom from '@sifrr/dom';
// const Sifrr = { Dom: SifrrDom };
window.newStore = new Sifrr.Dom.Store('string');

const template = `<p>\${this.newStore.value}</p>`;
class SifrrStore2 extends Sifrr.Dom.Element {
  static get useShadowRoot() {
    return false;
  }

  static get template() {
    return template;
  }

  constructor() {
    super();
    Sifrr.Dom.bindStoresToElement(this, [window.newStore]);
    this.newStore = window.newStore;
  }

  onUpdate() {
    if (!this.state.class) {
      if (this.className) this.removeAttribute('class');
    } else if (this.className !== this.state.class) {
      this.className = this.state.class;
    }
  }
}

Sifrr.Dom.register(SifrrStore2);
