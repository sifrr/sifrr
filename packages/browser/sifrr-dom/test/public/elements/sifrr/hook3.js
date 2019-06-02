// import SifrrDom from '@sifrr/dom';
// const Sifrr = { Dom: SifrrDom };
const newHook = new Sifrr.Dom.Hook(['a', 'b']);

const template = `<p>\${this.hooks.new.value[0]}\${this.hooks.new.value[1]}</p>`;
class SifrrHook3 extends Sifrr.Dom.Element {
  static get useShadowRoot() {
    return false;
  }

  static get template() {
    return template;
  }

  get hooks() {
    return { new: newHook };
  }

  onUpdate() {
    if (!this._state.class) {
      if (this.className) this.removeAttribute('class');
    } else if (this.className !== this._state.class) {
      this.className = this.state.class;
    }
  }
}
Sifrr.Dom.register(SifrrHook3);
