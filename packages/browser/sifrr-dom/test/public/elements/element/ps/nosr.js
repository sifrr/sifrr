class ElementPsNosr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<p>Sifrr \${this.state.ok} Simple</p>`;
  }

  static get useShadowRoot() {
    return false;
  }
}
ElementPsNosr.defaultState = { ok: 'ok' };
Sifrr.Dom.register(ElementPsNosr);
