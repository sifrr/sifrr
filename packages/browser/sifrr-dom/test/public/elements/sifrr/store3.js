// import SifrrDom from '@sifrr/dom';
// const Sifrr = { Dom: SifrrDom };
const newStore = new Sifrr.Dom.Store(['a', 'b']);

const template = `<p>\${this.stores.new.value[0]}\${this.stores.new.value[1]}</p>`;
class SifrrStore3 extends Sifrr.Dom.Element {
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
    if (!this.state.class) {
      if (this.className) this.removeAttribute('class');
    } else if (this.className !== this.state.class) {
      this.className = this.state.class;
    }
  }
}
Sifrr.Dom.register(SifrrStore3);
