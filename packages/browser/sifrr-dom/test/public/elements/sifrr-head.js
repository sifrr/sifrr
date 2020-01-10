class SifrrHead extends Sifrr.Dom.Element.extends(HTMLHeadElement) {
  static get template() {
    return Sifrr.Template.html`<meta charset="utf-8"><title>${({ state }) => state.title}</title>`;
  }

  static get useShadowRoot() {
    return false;
  }

  constructor() {
    super();
    this.state = {
      title: 'Home'
    };
  }
}

Sifrr.Dom.register(SifrrHead, {
  extends: 'head'
});
