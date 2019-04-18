class ElementAttrs extends Sifrr.Dom.Element {
  static observedAttrs() {
    return ['custom-attr'];
  }
}
Sifrr.Dom.register(ElementAttrs);
