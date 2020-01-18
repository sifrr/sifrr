class ElementAttrs extends Sifrr.Dom.Element {
  static get observedAttributes() {
    return ['custom-attr'];
  }
}
Sifrr.Dom.register(ElementAttrs);
