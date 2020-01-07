function setState(state) {
  return page.$eval('sifrr-update', (el, st) => el.setState(st), state);
}

describe('Update and updateAttribute', () => {
  before(async () => {
    await page.goto(`${PATH}/update.html`);
    await page.evaluate(async () => {
      await Sifrr.Dom.loading();
    });
    await page.evaluate(() => {
      window.su = document.querySelector('sifrr-update');
      window.attrdiv = window.su.$('#attribute');
      window.replaced = window.su.$('#replaced');
      window.row = window.su.$('#row');
    });
  });

  it('works with props', async () => {
    const propValue = await page.evaluate(() => su.$('#props').prop);
    const prop2Value = await page.evaluate(() => su.$('#props').prop2);
    const camelCasePropValue = await page.evaluate(() => su.$('#props').camelCase);
    const stateValue = await page.evaluate(() => {
      su.$('#props').onPropsChange = function(d) {
        this._dirty = d;
      };
      return su.$('#props').state;
    });
    await setState({ inner: { bang: 'bang' } });
    const stateValueNew = await page.evaluate(() => su.$('#props').state);
    const dirty = await page.evaluate(() => su.$('#props')._dirty);

    assert.equal(propValue, 'prop', 'works with binding prop');
    assert.equal(prop2Value, 'ok', 'works with string prop');
    assert.equal(camelCasePropValue, 'ok', 'works with hyphen case prop');
    assert.deepEqual(stateValue, { prop: 'prop' });
    assert.deepEqual(stateValueNew, { bang: 'bang' });
    assert.deepEqual(dirty, ['stateProp']);
  });

  it("doesn't remove attribute if it is empty", async () => {
    await setState({
      html:
        '<p>p</p><div id="attribute" some-attr _click="console.log(\'click\')" _keyup="console.log(\'keyup\')">div</div><div id="replaced"></div><a></a>'
    });
    const html = await page.evaluate('su.$("#html").innerHTML');

    assert.equal(
      html,
      '<p>p</p><div id="attribute" some-attr="" _click="console.log(\'click\')" _keyup="console.log(\'keyup\')">div</div><div id="replaced"></div><a></a>'
    );
  });

  it('renders falsy string if binding value is falsy', async () => {
    await setState({ text: false });
    const text = await page.evaluate('su.$("#text").textContent');

    assert.equal(text, 'some false text');
  });
});
