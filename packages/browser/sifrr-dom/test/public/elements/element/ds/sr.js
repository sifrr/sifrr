class ElementDsSr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<p>Sifrr \${this.state.ok} Simple</p>`;
  }
}
ElementDsSr.defaultState = { ok: 'ok' };
Sifrr.Dom.register(ElementDsSr);
