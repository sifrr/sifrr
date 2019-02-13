class ElementPsSr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<p>Sifrr \${this.state.ok} Simple</p>`;
  }
}
ElementPsSr.defaultState = { ok: 'ok' };
Sifrr.Dom.register(ElementPsSr);
