class ElementSelSr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<p class="ok">Sifrr \${this.state.ok} Simple</p><div class="ok">Sifrr \${this.state.ok} Simple</div>`;
  }
}
ElementSelSr.defaultState = { ok: 'ok' };
Sifrr.Dom.register(ElementSelSr);
