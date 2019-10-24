// import SifrrDom from '@sifrr/dom';
// const Sifrr = { Dom: SifrrDom };

const template = `<p>\${this.hahaStore.value.a}</p>`;
class SifrrStore extends Sifrr.Dom.Element {
  static get useShadowRoot() {
    return false;
  }

  static get template() {
    return template;
  }

  constructor() {
    super();
    Sifrr.Dom.bindStoresToElement(this, [window.hahaStore]);
    this.hahaStore = window.hahaStore;
  }

  onUpdate() {
    if (!this.state.class) {
      if (this.className) this.removeAttribute('class');
    } else if (this.className !== this.state.class) {
      this.className = this.state.class;
    }
  }
}

Sifrr.Dom.register(SifrrStore);
