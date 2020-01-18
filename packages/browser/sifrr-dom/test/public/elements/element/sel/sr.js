class ElementSelSr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Template.html`<p class="ok">Sifrr ${({ state }) =>
      state && state.ok} Simple</p><div class="ok">Sifrr ${({ state }) =>
      state && state.ok} Simple</div>`;
  }

  constructor() {
    super();
    this.state = { ok: 'ok' };
  }
}
ElementSelSr.defaultState = { ok: 'ok' };
Sifrr.Dom.register(ElementSelSr);
