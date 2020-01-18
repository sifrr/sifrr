class ElementPsSr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Template.html`<p>Sifrr ${({ state }) => state.ok} Simple</p>`;
  }
}
Sifrr.Dom.register(ElementPsSr);
