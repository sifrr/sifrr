// import SifrrDom from '@sifrr/dom';
// const Sifrr = { Dom: SifrrDom };
window.newStore2 = new Sifrr.Dom.Store(['a', 'b']);

const template = `<p>\${this.newStore.value[0]}\${this.newStore.value[1]}</p>`;
class SifrrStore3 extends Sifrr.Dom.Element {
  static get useShadowRoot() {
    return false;
  }

  static get template() {
    return template;
  }

  constructor() {
    super();
    Sifrr.Dom.bindStoresToElement(this, [window.newStore2]);
    this.newStore = window.newStore2;
  }

  onUpdate() {
    console.log(this.newStore);
    if (!this.state.class) {
      if (this.className) this.removeAttribute('class');
    } else if (this.className !== this.state.class) {
      this.className = this.state.class;
    }
  }
}

Sifrr.Dom.register(SifrrStore3);
