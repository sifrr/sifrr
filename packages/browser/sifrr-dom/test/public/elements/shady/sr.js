class ShadySr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<style>p{color: blue}</style><p>Sifrr \${this.state.ok} Simple</p>`;
  }
}
ShadySr.defaultState = { ok: 'ok' };
Sifrr.Dom.register(ShadySr);
