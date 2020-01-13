class TwowaySifrr extends Sifrr.Dom.Element {
  static get template() {
    return `<twoway-input :state="\${this.state.small}" :sifrr-bind="\${v => (this.setState({ small: v }))}"></twoway-input>
    <p>\${this.state.small.input}</p>`;
  }
}
TwowaySifrr.defaultState = { small: { input: 'abcd' } };
Sifrr.Dom.register(TwowaySifrr, { dependsOn: 'twoway-input' });