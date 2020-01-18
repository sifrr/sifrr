class ElementNodsNosr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Template.html`<p>Sifrr ${({ state }) => state && state.ok} Simple</p>`;
  }

  static get useShadowRoot() {
    return false;
  }
}
Sifrr.Dom.register(ElementNodsNosr);
