class ElementAsSr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<p>Sifrr \${this.state.ok} Simple</p>`;
  }
}
ElementAsSr.defaultState = { ok: 'ok' };
Sifrr.Dom.register(ElementAsSr);
