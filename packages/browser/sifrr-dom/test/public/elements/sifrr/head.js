class SifrrHead extends Sifrr.Dom.Element.extends(HTMLHeadElement) {
  static get template() {
    return Sifrr.Dom.html`<meta charset="utf-8">
    <title>{{this.state.title}}</title>`;
  }

  static get useShadowRoot() {
    return false;
  }
}
SifrrHead.defaultState = {
  title: 'Home'
};
Sifrr.Dom.register(SifrrHead, {
  extends: 'head'
});
