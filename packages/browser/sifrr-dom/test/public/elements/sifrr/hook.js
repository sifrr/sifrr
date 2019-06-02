// import SifrrDom from '@sifrr/dom';
// const Sifrr = { Dom: SifrrDom };
const hahaHook = new Sifrr.Dom.Hook({ a: 'hahaha' });

const template = `<p>\${this.hooks.haha.value.a}</p>`;
class SifrrHook extends Sifrr.Dom.Element {
  static get useShadowRoot() {
    return false;
  }

  static get template() {
    return template;
  }

  get hooks() {
    return { haha: hahaHook };
  }

  onUpdate() {
    if (!this._state.class) {
      if (this.className) this.removeAttribute('class');
    } else if (this.className !== this._state.class) {
      this.className = this.state.class;
    }
  }
}
Sifrr.Dom.register(SifrrHook);
