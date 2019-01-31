class SifrrHead extends Sifrr.Dom.Element.extends(HTMLHeadElement) {
  static get template() {
    const template = document.createElement('template');
    template.innerHTML = '<meta charset="utf-8"><title>${this.state.title}</title>';
    return Sifrr.Dom.template(template);
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
