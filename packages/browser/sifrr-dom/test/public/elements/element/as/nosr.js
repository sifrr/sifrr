class ElementAsNosr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<p>Sifrr \${this.state.ok} Simple</p>`;
  }

  static get useShadowRoot() {
    return false;
  }
}
ElementAsNosr.defaultState = { ok: 'ok' };
Sifrr.Dom.register(ElementAsNosr);
