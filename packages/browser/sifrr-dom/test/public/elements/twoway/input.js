class TwowayInput extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<div>\${this.state.input}</div>
    <div :sifrr-html="true" id="html">\${this.state.input}</div>
    <input value=\${this.state.input} :sifrr-bind="input">`;
  }
}
TwowayInput.defaultState = { input: 'input' };
Sifrr.Dom.register(TwowayInput);
