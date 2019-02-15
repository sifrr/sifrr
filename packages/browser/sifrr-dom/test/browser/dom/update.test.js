function setState(state) {
  return page.$eval('sifrr-update', (el, st) => el.state = st, state);
}

describe('Siffr.Dom', () => {
  before(async () => {
    await page.goto(`${PATH}/update.html`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
    await page.evaluate(() => {
      window.su = document.querySelector('sifrr-update');
      window.attrdiv = window.su.$('#attribute');
      window.replaced = window.su.$('#replaced');
      window.row = window.su.$('#row');
    });
  });

  it("doesn't rerender other things when updating text", async () => {
    await setState({ text: 'ok' });
    const sameDiv = await page.evaluate("window.attrdiv === su.$('#attribute')");
    const text = await page.evaluate('su.$("#text").textContent');

    assert.equal(text, 'some ok text');
    assert(sameDiv);
  });

  it("doesn't rerender other things when updating attribute", async () => {
    await setState({ html: '<p>p</p><div id="attribute" some-attr="newrandom" _click="console.log(\'click\')" _keyup="console.log(\'keyup\')">div</div><p id="replaced"></p><a></a>' });
    const sameDiv = await page.evaluate("window.attrdiv === su.$('#attribute')");

    assert(sameDiv);
  });

  it("doesn't rerender other things when changing one node", async () => {
    await setState({ html: '<p>p</p><div id="attribute" some-attr="newrandom" _click="console.log(\'click\')" _keyup="console.log(\'keyup\')">div</div><div id="replaced"></div><a></a>' });
    const sameDiv = await page.evaluate("window.attrdiv === su.$('#attribute')");
    const sameP = await page.evaluate("window.replaced === window.su.$('#replaced')");

    assert(sameDiv);
    assert(!sameP);
  });

  it("doesn't remove attribute if it is empty", async () => {
    await setState({ html: '<p>p</p><div id="attribute" some-attr _click="console.log(\'click\')" _keyup="console.log(\'keyup\')">div</div><div id="replaced"></div><a></a>' });
    const html = await page.evaluate('su.$("#html").innerHTML');

    assert.equal(html, '<p>p</p><div id="attribute" some-attr="" _click="console.log(\'click\')" _keyup="console.log(\'keyup\')">div</div><div id="replaced"></div><a></a>');
  });

  it('adds attribute if it is empty', async () => {
    await setState({ html: '<p>p</p><div id="attribute" random-attr="" _click="console.log(\'click\')" _keyup="console.log(\'keyup\')">div</div><div id="replaced"></div><a></a>' });
    const html = await page.evaluate('su.$("#html").innerHTML');

    assert.equal(html, '<p>p</p><div id="attribute" _click="console.log(\'click\')" _keyup="console.log(\'keyup\')" random-attr="">div</div><div id="replaced"></div><a></a>');
  });

  it('renders empty string if binding value is falsy', async () => {
    await setState({ text: false });
    const text = await page.evaluate('su.$("#text").textContent');

    assert.equal(text, 'some  text');
  });

  it('passes state of a sifrr element', async () => {
    const res = await page.evaluate(() => {
      const newrow = document.createElement('tr', { is: 'sifrr-row' });
      newrow.id = 'row';
      newrow.state = {
        id: 2,
        label: 'new'
      };
      window.su.state = { row: newrow };
      return {
        sameRow: window.row === window.su.$('#row'),
        state: window.su.$('#row').state
      };
    });

    assert.equal(res.sameRow, true);
    expect(res.state).to.deep.equal({
      id: 2,
      label: 'new'
    });
  });
});
