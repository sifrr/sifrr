// import SifrrDom from '@sifrr/dom';
// const Sifrr = { Dom: SifrrDom };

const template = `<p>\${this.hook.value.a}</p>`;
class SifrrHook extends Sifrr.Dom.Element {
  static get useShadowRoot() {
    return false;
  }

  static get template() {
    return template;
  }

  get hook() {
    return new Sifrr.Dom.Hook({ a: 'hahaha' });
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
