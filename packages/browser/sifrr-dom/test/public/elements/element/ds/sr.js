class ElementDsSr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Template.html`<p>Sifrr ${({ state }) => state.ok} Simple</p>`;
  }

  constructor() {
    super();
    this.state = { ok: 'ok' };
  }
}
Sifrr.Dom.register(ElementDsSr);
