class LoadingCustom extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Template.html`<p>Loading Custom Js</p>`;
  }
}
Sifrr.Dom.register(LoadingCustom);
