class ElementSelNosr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<p class="ok">Sifrr \${this.state.ok} Simple</p><div class="ok">Sifrr \${this.state.ok} Simple</div>`;
  }

  static get useShadowRoot() {
    return false;
  }
}
ElementSelNosr.defaultState = { ok: 'ok' };
Sifrr.Dom.register(ElementSelNosr);
