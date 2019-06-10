// import SifrrDom from '@sifrr/dom';
// const Sifrr = { Dom: SifrrDom };
const newStore = new Sifrr.Dom.Store('string');

const template = `<p>\${this.stores.new.value}</p>`;
class SifrrStore2 extends Sifrr.Dom.Element {
  static get useShadowRoot() {
    return false;
  }

  static get template() {
    return template;
  }

  get stores() {
    return { new: newStore };
  }

  onUpdate() {
    if (!this._state.class) {
      if (this.className) this.removeAttribute('class');
    } else if (this.className !== this._state.class) {
      this.className = this.state.class;
    }
  }
}
Sifrr.Dom.register(SifrrStore2);
