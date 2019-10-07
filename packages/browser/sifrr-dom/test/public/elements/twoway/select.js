class TwowaySelect extends Sifrr.Dom.Element {
  static get template() {
    return Sifrr.Dom.template`<div>\${this.state.select}</div>
    <select name="select" :sifrr-bind="select" value="\${this.state.select}">
      <option value="volvo">Volvo</option>
      <option value="saab">Saab</option>
      <option value="mercedes">Mercedes</option>
      <option value="audi">Audi</option>
    </select>`;
  }
}
TwowaySelect.defaultState = { select: 'volvo' };
Sifrr.Dom.register(TwowaySelect);
