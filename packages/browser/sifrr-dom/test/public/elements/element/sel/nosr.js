class ElementSelNosr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Template.html`<p class="ok">Sifrr ${({ state }) =>
      state && state.ok} Simple</p><div class="ok">Sifrr ${({ state }) =>
      state && state.ok} Simple</div>`;
  }

  static get useShadowRoot() {
    return false;
  }

  constructor() {
    super();
    this.state = { ok: 'ok' };
  }
}
ElementSelNosr.defaultState = { ok: 'ok' };
Sifrr.Dom.register(ElementSelNosr);
