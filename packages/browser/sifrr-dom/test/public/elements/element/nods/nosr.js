class ElementNodsNosr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<p>Sifrr \${this.state.ok} Simple</p>`;
  }

  static get useShadowRoot() {
    return false;
  }
}
Sifrr.Dom.register(ElementNodsNosr);
