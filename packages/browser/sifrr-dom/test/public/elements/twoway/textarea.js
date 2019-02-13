class TwowayTextarea extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<div>\${this.state.textarea}</div>
    <div data-sifrr-html="true" id="html">\${this.state.textarea}</div>
    <textarea name="textarea" rows="2" cols="40" data-sifrr-bind="textarea">\${this.state.textarea}</textarea>`;
  }
}
TwowayTextarea.defaultState = { textarea: 'textarea' };
Sifrr.Dom.register(TwowayTextarea);
