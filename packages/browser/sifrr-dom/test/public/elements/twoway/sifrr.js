class TwowaySifrr extends Sifrr.Dom.Element {
  static get template() {
    return `<sifrr-small _state="\${console.log('down');return this.state.small}" data-sifrr-bind="small"></sifrr-small>`;
  }
}
TwowaySifrr.defaultState = { small: { a: 'b' } };
Sifrr.Dom.register(TwowaySifrr, { dependsOn: 'sifrr-small' });
