class ElementDsNosr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Template.html`<p>Sifrr ${({ state }) => state.ok} Simple</p>`;
  }

  static get useShadowRoot() {
    return false;
  }

  constructor() {
    super();
    this.state = { ok: 'ok' };
  }
}
Sifrr.Dom.register(ElementDsNosr);
