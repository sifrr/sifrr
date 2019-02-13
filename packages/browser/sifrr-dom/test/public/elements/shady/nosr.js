class ShadyNosr extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<style>shady-nosr p{color: red}</style><p>Sifrr \${this.state.ok} Simple</p>`;
  }

  static get useShadowRoot() {
    return false;
  }
}
ShadyNosr.defaultState = { ok: 'ok' };
Sifrr.Dom.register(ShadyNosr);
