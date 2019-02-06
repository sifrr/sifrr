async function testElement(elName, str) {
  expect(await page.evaluate((el) => typeof Sifrr.Dom.elements[el], elName)).to.eq('function');
  expect(await page.$eval(elName, el => el.shadowRoot.innerHTML)).to.have.string(str);
}

describe('Sifrr.Dom.load', () => {
  before(async () => {
    await page.goto(`${PATH}/loading.html`);
    // await page.evaluate(async () => { await Sifrr.Dom.loading(); });
  });

  it('has all defined elements', async () => {
    await testElement('loading-load', 'Loading Load');
    await testElement('loading-loadjs', 'Loading Loadjs');
    await testElement('loading-src', 'Loading Src');
    await testElement('loading-custom', 'Loading Custom Url');
    await testElement('loading-custom2', 'Loading Custom Js');
    await testElement('loading-module', 'Loading Module');
    await testElement('loading-module2', 'Loading Module Import');
    await testElement('loading-separatejs', 'Loading Separate JS');
  });
});
