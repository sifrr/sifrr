class LoadingModule extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Template.html`<p>Loading Module</p>`;
  }
}
Sifrr.Dom.register(LoadingModule);
