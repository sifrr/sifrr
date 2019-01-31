async function shadow(selector) {
  return await page.$eval(selector, el => el.shadowRoot.innerHTML);
}

describe('Sifrr.Dom.Element', () => {
  before(async () => {
    await page.goto(`${PATH}/loading.html`);
    await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });

  it('has all defined elements', async () => {
    expect(await shadow('loading-load')).to.have.string('Loading Load');
    expect(await shadow('loading-loadjs')).to.have.string('Loading Loadjs');
    // Not working in circleci ?
    // expect(await shadow('loading-module')).to.have.string('Loading Module');
    // expect(await shadow('loading-module2')).to.have.string('Loading Module Import');
    expect(await shadow('loading-src')).to.have.string('Loading Src');
    expect(await shadow('loading-custom')).to.have.string('Loading Custom Url');
    expect(await shadow('loading-custom2')).to.have.string('Loading Custom Js');
  });
});
