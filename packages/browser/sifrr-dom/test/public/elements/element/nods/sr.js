class ElementNodsSr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<p>Sifrr \${this.state.ok} Simple</p>`;
  }
}
Sifrr.Dom.register(ElementNodsSr);
